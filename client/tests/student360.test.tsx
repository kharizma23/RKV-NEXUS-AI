import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Student360Page } from '../src/components/student360/Student360Page';
import { ProfileCards } from '../src/components/student360/ProfileCards';
import { CompetencyRadar } from '../src/components/student360/CompetencyRadar';
import { AIHospiceSummary } from '../src/components/student360/AIHospiceSummary';
import { apiClient, ApiError } from '../src/lib/api/client';
import { Student360Profile } from '../src/components/student360/types';

vi.mock('../src/lib/api/client', () => {
  const getMock = vi.fn();
  const postMock = vi.fn();
  const client: any = vi.fn();
  client.get = getMock;
  client.post = postMock;
  return {
    apiClient: client,
    ApiError: class ApiError extends Error {
      status: number;
      code: string;
      constructor(message: string, code: string, status: number) {
        super(message);
        this.status = status;
        this.code = code;
      }
    },
  };
});

const mockProfile: Student360Profile = {
  student_id: 'a0000000-0000-0000-0000-000000000001',
  full_name: 'Aditya Ramanathan',
  roll_number: '23CSE001',
  institution: 'RKV Institute of Advanced Technology',
  department: 'Computer Science & Engineering',
  programme: 'B.Tech CSE',
  semester: 6,
  academic_score: 88.5,
  attendance_rate: 95,
  wellness_index: 91,
  skill_score: 87,
  placement_readiness: 89.5,
  composite_score: 90.2,
  ai_summary: 'Exemplary candidate demonstrating balanced rigor across 88.5% academic mastery and 89.5% placement velocity.',
  last_evaluated: '2026-10-09',
  evaluated_by: 'System Administrator',
  radar_dimensions: [
    { dimension: 'Academics', value: 88.5, fullMark: 100 },
    { dimension: 'Attendance', value: 95, fullMark: 100 },
    { dimension: 'Wellness', value: 91, fullMark: 100 },
    { dimension: 'Skill', value: 87, fullMark: 100 },
    { dimension: 'Placement', value: 89.5, fullMark: 100 },
  ],
};

describe('Student 360° Profile Inspector Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockResolvedValue(mockProfile);
    (apiClient.post as any).mockResolvedValue(mockProfile);
  });

  it('renders all 5 KPI cards with exact values and labels', () => {
    render(<ProfileCards profile={mockProfile} />);

    expect(screen.getByText('88.5%')).toBeInTheDocument();
    expect(screen.getByText('Semester Average')).toBeInTheDocument();

    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('Biometric Verified')).toBeInTheDocument();

    expect(screen.getByText('91%')).toBeInTheDocument();
    expect(screen.getByText('Resilience Score')).toBeInTheDocument();

    expect(screen.getByText('87%')).toBeInTheDocument();
    expect(screen.getByText('Industry Verified')).toBeInTheDocument();

    expect(screen.getByText('89.5%')).toBeInTheDocument();
    expect(screen.getByText('Tier-1 Qualified')).toBeInTheDocument();
  });

  it('renders pentagonal competency radar chart with 5 dimensions', () => {
    const { container } = render(<CompetencyRadar dimensions={mockProfile.radar_dimensions} />);

    const svg = container.querySelector('#pentagonal-competency-radar');
    expect(svg).toBeInTheDocument();
    expect(screen.getByText('Academics')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Wellness')).toBeInTheDocument();
    expect(screen.getByText('Skill')).toBeInTheDocument();
    expect(screen.getByText('Placement')).toBeInTheDocument();
  });

  it('renders AI holistic synthesis summary panel with composite score and meta info', () => {
    render(<AIHospiceSummary profile={mockProfile} />);

    expect(screen.getByText('AI Holistic Synthesis Summary')).toBeInTheDocument();
    expect(screen.getByText('90.2')).toBeInTheDocument();
    expect(screen.getByText(/Exemplary candidate demonstrating balanced rigor/)).toBeInTheDocument();
    expect(screen.getByText('a0000000-0000-0000-0000-000000000001')).toBeInTheDocument();
    expect(screen.getByText('Aditya Ramanathan')).toBeInTheDocument();
    expect(screen.getByText('2026-10-09')).toBeInTheDocument();
    expect(screen.getByText('System Administrator')).toBeInTheDocument();
  });

  it('loads active scholar profile when UUID is left empty', async () => {
    render(<Student360Page />);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/admin/students/profile-360');
    });

    expect(screen.getAllByText('Aditya Ramanathan')[0]).toBeInTheDocument();
    expect(screen.getByText('23CSE001')).toBeInTheDocument();
  });

  it('validates UUID format and shows error toast without making API call when invalid', async () => {
    render(<Student360Page />);

    await waitFor(() => {
      expect(screen.getAllByText('Aditya Ramanathan')[0]).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Enter Student UUID/i);
    fireEvent.change(input, { target: { value: 'not-a-valid-uuid' } });

    const inspectBtn = screen.getByRole('button', { name: /inspect profile/i });
    fireEvent.click(inspectBtn);

    expect(screen.getByText('Invalid Student UUID format')).toBeInTheDocument();
    // apiClient.get should only have been called once (the initial active scholar load)
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it('calls API with UUID and updates profile when valid UUID is entered', async () => {
    render(<Student360Page />);

    await waitFor(() => {
      expect(screen.getAllByText('Aditya Ramanathan')[0]).toBeInTheDocument();
    });

    const newProfile = {
      ...mockProfile,
      student_id: 'b1111111-1111-1111-1111-111111111111',
      full_name: 'Priya Sharma',
      roll_number: '23CSE042',
      academic_score: 92.0,
      composite_score: 93.4,
    };
    (apiClient.get as any).mockResolvedValueOnce(newProfile);

    const input = screen.getByPlaceholderText(/Enter Student UUID/i);
    fireEvent.change(input, { target: { value: 'b1111111-1111-1111-1111-111111111111' } });

    const inspectBtn = screen.getByRole('button', { name: /inspect profile/i });
    fireEvent.click(inspectBtn);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/admin/students/b1111111-1111-1111-1111-111111111111/profile-360');
    });

    await waitFor(() => {
      expect(screen.getAllByText('Priya Sharma')[0]).toBeInTheDocument();
      expect(screen.getByText('23CSE042')).toBeInTheDocument();
    });
  });

  it('shows not found toast when UUID does not exist in database', async () => {
    render(<Student360Page />);

    await waitFor(() => {
      expect(screen.getAllByText('Aditya Ramanathan')[0]).toBeInTheDocument();
    });

    const missingUUID = '00000000-0000-0000-0000-000000000000';
    (apiClient.get as any).mockRejectedValueOnce(
      new ApiError(`Student not found with ID: ${missingUUID}`, 'NOT_FOUND', 404)
    );

    const input = screen.getByPlaceholderText(/Enter Student UUID/i);
    fireEvent.change(input, { target: { value: missingUUID } });

    const inspectBtn = screen.getByRole('button', { name: /inspect profile/i });
    fireEvent.click(inspectBtn);

    await waitFor(() => {
      expect(screen.getByText(`Student not found with ID: ${missingUUID}`)).toBeInTheDocument();
    });
  });

  it('triggers recalculate when Recalculate 360° button is clicked', async () => {
    const recalculatedProfile = {
      ...mockProfile,
      academic_score: 90.0,
      composite_score: 91.5,
      ai_summary: 'Recalculated executive summary with enhanced scores.',
    };
    (apiClient.post as any).mockResolvedValueOnce(recalculatedProfile);

    render(<Student360Page />);

    await waitFor(() => {
      expect(screen.getAllByText('Aditya Ramanathan')[0]).toBeInTheDocument();
    });

    const recalcBtn = screen.getByRole('button', { name: /recalculate 360°/i });
    fireEvent.click(recalcBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
      expect(screen.getByText('Profile recalculated successfully')).toBeInTheDocument();
    });
  });
});
