'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-1">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>403 - Unauthorized Access Attempt</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You do not have the required permissions or role authorization to access this area. If you believe this is an error, please contact your administrator.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-3">
          <Link href="/login">
            <Button variant="outline" size="sm">Sign In with Another Account</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
