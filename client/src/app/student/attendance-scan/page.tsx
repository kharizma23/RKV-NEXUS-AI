import React from 'react';
import { QRScanner } from '@/components/attendance/QRScanner';

export default function StudentAttendanceScanPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <QRScanner />
    </div>
  );
}
