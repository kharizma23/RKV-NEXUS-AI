'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Lock, Mail, Eye, EyeOff, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const user: any = await login(email, password);
      const userRoles: string[] = Array.isArray(user?.roles)
        ? user.roles
        : (user?.role ? [user.role] : []);

      if (userRoles.includes('ADMIN')) {
        router.push('/admin/dashboard');
      } else if (userRoles.includes('FACULTY')) {
        if (user.is_approved === false || user.account_status === 'PENDING_APPROVAL') {
          setErrorMessage('Your faculty account is pending administrator approval.');
        } else {
          router.push('/faculty/dashboard');
        }
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      console.error('Login submit error:', err);
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto flex flex-col items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 flex flex-col items-center justify-center text-white shadow-md shadow-indigo-500/25 border border-indigo-400/20">
              <GraduationCap className="w-4 h-4 text-indigo-200 mb-0.5" />
              <span className="text-[11px] font-black tracking-wider leading-none text-white">RKV</span>
            </div>
            <span className="mt-1.5 text-[11px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              RKV NEXUS
            </span>
          </div>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access your dashboard
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address / Username</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </Button>

            {/* Quick Demo Access Buttons */}
            <div className="w-full pt-1">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick Demo Access</span>
                <div className="flex-grow border-t border-border"></div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setEmail('student@platform.edu');
                    setPassword('Student123');
                    setIsSubmitting(true);
                    try {
                      await login('student@platform.edu', 'Student123');
                      router.push('/student/dashboard');
                    } catch (e) {
                      router.push('/student/dashboard');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="text-xs h-8 px-1 font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  🎓 Student
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setEmail('faculty@platform.edu');
                    setPassword('Faculty123');
                    setIsSubmitting(true);
                    try {
                      await login('faculty@platform.edu', 'Faculty123');
                      router.push('/faculty/dashboard');
                    } catch (e) {
                      router.push('/faculty/dashboard');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="text-xs h-8 px-1 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                >
                  👨‍🏫 Faculty
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setEmail('Admin23@gmail.com');
                    setPassword('ADMIN123');
                    setIsSubmitting(true);
                    try {
                      await login('Admin23@gmail.com', 'ADMIN123');
                      router.push('/admin/dashboard');
                    } catch (e) {
                      router.push('/admin/dashboard');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="text-xs h-8 px-1 font-semibold text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                >
                  🛡️ Admin
                </Button>
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>Don't have an account?</p>
              <div className="flex justify-center space-x-3 font-medium">
                <Link href="/register/student" className="text-primary hover:underline">Register Student</Link>
                <span>&bull;</span>
                <Link href="/register/faculty" className="text-primary hover:underline">Register Faculty</Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
