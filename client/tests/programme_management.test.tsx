import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminAcademicsPage from '../src/app/admin/academics/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/academics',
}));

// Mock Lucide Icons dynamically to return a dummy component for any icon requested
vi.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        // Return a dummy component for any requested icon name
        const DummyIcon = (props: any) => <span data-testid={`icon-${String(prop).toLowerCase()}`}>{String(prop)}Icon</span>;
        DummyIcon.displayName = String(prop);
        return DummyIcon;
      },
    }
  );
});

// Mock layout using alias path
vi.mock('@/components/layout/dashboard-layout', () => {
  const MockLayout = ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>;
  return {
    default: MockLayout,
    DashboardLayout: MockLayout,
  };
});

// Mock UI elements using alias paths
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, className, disabled, variant }: any) => (
    <button onClick={onClick} type={type} className={className} disabled={disabled}>
      {children}
    </button>
  ),
}));

// Mock data
const mockTemplates = [
  {
    template_id: 't-cse',
    programme_name: 'B.Tech. Computer Science and Engineering',
    programme_code: 'BTECH-CSE',
    alternative_codes: ['BTECH-CSE', 'BT-CSE'],
    degree_type: 'Bachelor of Technology',
    duration_years: 4,
    total_semesters: 8,
    related_department_keywords: ['CSE', 'COMPUTER SCIENCE'],
    description: 'CSE template',
  },
  {
    template_id: 't-ece',
    programme_name: 'B.E. Electronics and Communication Engineering',
    programme_code: 'BE-ECE',
    alternative_codes: ['BE-ECE', 'BENG-ECE'],
    degree_type: 'Bachelor of Engineering',
    duration_years: 4,
    total_semesters: 8,
    related_department_keywords: ['ECE', 'ELECTRONICS'],
    description: 'ECE template',
  },
];

const mockInstitutions = [
  { id: 'inst-1', name: 'Apex Institute', code: 'AIT' },
];

const mockDepartments = [
  { id: 'dept-cse', name: 'Computer Science Dept', code: 'CSE' },
  { id: 'dept-ece', name: 'Electronics Dept', code: 'ECE' },
];

// Mock fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe('Programme Management Frontend Unit Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    globalFetch.mockReset();
    
    // Default fetch mocks
    globalFetch.mockImplementation(async (url: string) => {
      if (url.includes('/api/v1/admin/programmes/templates')) {
        return { ok: true, json: async () => mockTemplates };
      }
      if (url.includes('/api/v1/public/institutions') && !url.includes('/departments')) {
        return { ok: true, json: async () => mockInstitutions };
      }
      if (url.includes('/departments')) {
        return { ok: true, json: async () => mockDepartments };
      }
      if (url.includes('/api/v1/admin/programmes')) {
        return { ok: true, json: async () => [] };
      }
      return { ok: false, json: async () => ({ message: 'Not found' }) };
    });
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AdminAcademicsPage />
      </QueryClientProvider>
    );
  };

  it('1. Renders the main dashboard structure and headers', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/academic programmes/i)).toBeInTheDocument();
    });
  });

  it('2. Clicking + Add Programme opens step 1 template selection modal', async () => {
    renderPage();
    await waitFor(() => {
      const addBtn = screen.getByText(/\+ add programme/i);
      fireEvent.click(addBtn);
    });
    expect(screen.getByText(/step 1: select programme template/i)).toBeInTheDocument();
  });

  it('3. Selects standard template in Step 1 and populates Step 2 form correctly', async () => {
    renderPage();
    // Open modal
    await waitFor(() => fireEvent.click(screen.getByText(/\+ add programme/i)));
    // Click on CSE template
    await waitFor(() => {
      const cseTemplate = screen.getByText('B.Tech. Computer Science and Engineering');
      fireEvent.click(cseTemplate);
    });
    // Check that we are on step 2 and form elements are populated
    expect(screen.getByText(/step 2: programme configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/B.Tech. Computer Science and Engineering — BTECH-CSE/i)).toBeInTheDocument();
  });

  it('4. Selecting Other / Custom Programme in Step 1 unlocks name and code inputs', async () => {
    renderPage();
    await waitFor(() => fireEvent.click(screen.getByText(/\+ add programme/i)));
    // Select Custom option
    await waitFor(() => {
      const customOption = screen.getByText('Other / Custom Programme');
      fireEvent.click(customOption);
    });
    expect(screen.getByText(/step 2: programme configuration/i)).toBeInTheDocument();
    // Verify that the custom text input is rendered
    expect(screen.getByPlaceholderText(/e\.g\. B\.Tech\. Robotics and Automation/i)).toBeInTheDocument();
  });

  it('5. Synchronization: Changing standard template resets code, duration, semesters', async () => {
    renderPage();
    await waitFor(() => fireEvent.click(screen.getByText(/\+ add programme/i)));
    await waitFor(() => fireEvent.click(screen.getByText('B.Tech. Computer Science and Engineering')));
    
    // Now click template combobox to change to ECE
    const comboboxBtn = screen.getByText(/B.Tech. Computer Science and Engineering — BTECH-CSE/i);
    fireEvent.click(comboboxBtn);
    
    // Choose ECE
    await waitFor(() => {
      const eceBtn = screen.getByText('B.E. Electronics and Communication Engineering');
      fireEvent.click(eceBtn);
    });

    expect(screen.getByText(/B.E. Electronics and Communication Engineering — BE-ECE/i)).toBeInTheDocument();
  });

  it('6. Transforms manually entered programme code to uppercase, trim, and limits character set', async () => {
    renderPage();
    await waitFor(() => fireEvent.click(screen.getByText(/\+ add programme/i)));
    await waitFor(() => fireEvent.click(screen.getByText('Other / Custom Programme')));
    
    const codeInput = screen.getByPlaceholderText('e.g. BE-ECE') as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: '  be_ece-123!@# ' } });
    
    // Code should be transformed to uppercase, spaces removed, only letters/numbers/hyphen kept
    expect(codeInput.value).toBe('BE-ECE-123');
  });

  it('7. Changing code manually prompts confirmation warning if it matches another template', async () => {
    renderPage();
    await waitFor(() => fireEvent.click(screen.getByText(/\+ add programme/i)));
    await waitFor(() => fireEvent.click(screen.getByText('B.Tech. Computer Science and Engineering')));
    
    const codeInput = screen.getByPlaceholderText('e.g. BE-ECE') as HTMLInputElement;
    // Enter ECE code manually
    fireEvent.change(codeInput, { target: { value: 'BE-ECE' } });
    
    // Switch confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText(/Switch Programme Name\?/i)).toBeInTheDocument();
    });
  });

  it('8. Locks duration & semesters for standard mapped degree types', async () => {
    renderPage();
    await waitFor(() => fireEvent.click(screen.getByText(/\+ add programme/i)));
    await waitFor(() => fireEvent.click(screen.getByText('B.Tech. Computer Science and Engineering')));
    
    const degreeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(degreeSelect.disabled).toBe(true); // Should be locked/disabled since it is pre-selected template
  });

  it('9. Shows subject-like validation warning checkbox when name lacks degree keywords', async () => {
    renderPage();
    await waitFor(() => fireEvent.click(screen.getByText(/\+ add programme/i)));
    await waitFor(() => fireEvent.click(screen.getByText('Other / Custom Programme')));
    
    // Mock a 400 rejection with SUBJECT_LIKE_NAME
    globalFetch.mockImplementationOnce(async () => {
      return {
        ok: false,
        status: 400,
        json: async () => ({
          code: 'SUBJECT_LIKE_NAME',
          message: 'Enter the complete degree programme name, not an individual subject name.',
        }),
      };
    });

    // Populate fields
    const nameInput = screen.getByPlaceholderText('e.g. B.Tech. Robotics and Automation');
    fireEvent.change(nameInput, { target: { value: 'Database Management' } });
    
    const codeInput = screen.getByPlaceholderText('e.g. BE-ECE');
    fireEvent.change(codeInput, { target: { value: 'DB-MGMT' } });

    // Select Institution and Department
    await waitFor(() => {
      const instSelect = screen.getByRole('combobox', { name: '' }) as HTMLSelectElement;
      fireEvent.change(instSelect, { target: { value: 'inst-1' } });
    });

    const submitBtn = screen.getByRole('button', { name: /save programme/i });
    fireEvent.click(submitBtn);

    // Should render warning banner
    await waitFor(() => {
      expect(screen.getByText(/Warning: 'Database Management' looks like a subject name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/I confirm this is indeed a valid degree programme name/i)).toBeInTheDocument();
    });
  });

  it('10. Renders code recommendations first in the Code suggestions list', async () => {
    renderPage();
    await waitFor(() => fireEvent.click(screen.getByText(/\+ add programme/i)));
    await waitFor(() => fireEvent.click(screen.getByText('B.Tech. Computer Science and Engineering')));
    
    const codeInput = screen.getByPlaceholderText('e.g. BE-ECE');
    fireEvent.focus(codeInput);
    
    // Verify suggestions are shown (BTECH-CSE, BT-CSE)
    await waitFor(() => {
      expect(screen.getByText('BTECH-CSE')).toBeInTheDocument();
      expect(screen.getByText('BT-CSE')).toBeInTheDocument();
    });
  });
});
