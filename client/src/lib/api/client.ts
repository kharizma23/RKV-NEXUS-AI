export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: any;
  request_id?: string;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;
  requestId?: string;

  constructor(message: string, code: string, status: number, details?: any, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('/') ? `/api/v1${endpoint}` : `/api/v1/${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Automatically attach JWT token and user email from localStorage/cookies if available
  if (typeof window !== 'undefined') {
    try {
      let token =
        localStorage.getItem('antigravity_token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('jwt') ||
        '';

      let email = '';
      let role = '';

      const storedUser = localStorage.getItem('antigravity_auth_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          token = token || parsed.access_token || parsed.token || '';
          email = parsed.email || '';
          role = parsed.role || (Array.isArray(parsed.roles) ? parsed.roles[0] : '') || '';
        } catch {}
      }

      // Check document cookies for access_token as fallback
      if (!token && typeof document !== 'undefined' && document.cookie) {
        const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
        if (match) {
          token = decodeURIComponent(match[1]);
        }
      }

      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (email && !headers.has('X-User-Email')) {
        headers.set('X-User-Email', email);
      }
      if (role && !headers.has('X-Demo-Role')) {
        headers.set('X-Demo-Role', String(role).toLowerCase());
      }
    } catch {
      // Ignore storage errors
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response = await fetch(url, config);

  // Attempt refresh on 401 UNAUTHORIZED if not already calling auth endpoints
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (isRefreshing) {
      try {
        await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        return apiClient<T>(endpoint, options);
      } catch (err) {
        throw err;
      }
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        try {
          const rData = await refreshRes.json();
          const newToken = rData?.access_token || rData?.token;
          if (newToken && typeof window !== 'undefined') {
            localStorage.setItem('access_token', newToken);
            localStorage.setItem('antigravity_token', newToken);
            localStorage.setItem('token', newToken);
          }
        } catch {}
        processQueue(null);
        isRefreshing = false;
        return apiClient<T>(endpoint, options);
      } else {
        processQueue(new Error('Session expired'));
        isRefreshing = false;
      }
    } catch (refreshErr) {
      processQueue(refreshErr);
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        code: 'UNKNOWN_ERROR',
        message: response.statusText || 'An unexpected error occurred',
      };
    }
    const message = (errorData as any)?.detail || errorData.message || 'API request failed';
    throw new ApiError(
      message,
      errorData.code || 'HTTP_ERROR',
      response.status,
      errorData.details || (errorData as any)?.detail,
      errorData.request_id
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

apiClient.get = <T>(endpoint: string, options?: RequestInit): Promise<T> =>
  apiClient<T>(endpoint, { ...options, method: 'GET' });

apiClient.post = <T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

apiClient.put = <T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

apiClient.patch = <T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> =>
  apiClient<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

apiClient.delete = <T>(endpoint: string, options?: RequestInit): Promise<T> =>
  apiClient<T>(endpoint, { ...options, method: 'DELETE' });
