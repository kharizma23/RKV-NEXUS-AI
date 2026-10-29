'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { PlusCircle, Sparkles, Glasses, CheckCircle2 } from 'lucide-react';

interface VRLabSetupProps {
  onCreated?: () => void;
}

export function VRLabSetup({ onCreated }: VRLabSetupProps) {
  const [title, setTitle] = useState('');
  const [vrSceneUrl, setVrSceneUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [experimentType, setExperimentType] = useState('PHYSICS_OPTICS');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient('/vr/exams', {
        method: 'POST',
        body: JSON.stringify({
          title,
          vr_scene_url: vrSceneUrl,
          duration_minutes: durationMinutes,
          experiment_type: experimentType,
          description
        })
      });
      setSuccess(true);
      setTitle('');
      setVrSceneUrl('');
      setDescription('');
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err?.message || 'Failed to create VR scene');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
          <Glasses className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Deploy New 3D / VR Virtual Laboratory Scene</h2>
          <p className="text-xs text-muted-foreground">Configure WebXR environments, instrument tolerances, and auto-evaluation telemetry hooks</p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>New 3D VR Exam Scene deployed and published to student dashboards!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-foreground">Simulation Title:</label>
            <input
              type="text"
              placeholder="e.g. 6-DOF Robotic Arm Inverse Kinematics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">Discipline / Lab Type:</label>
            <select
              value={experimentType}
              onChange={(e) => setExperimentType(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground font-semibold"
            >
              <option value="PHYSICS_OPTICS">Physics Optics & Lasers</option>
              <option value="CHEMISTRY_TITRATION">Chemical Reaction Titration</option>
              <option value="CIRCUITS_BREADBOARD">Digital Electronics & Microcontrollers</option>
              <option value="ROBOTICS_ARM">Robotics & Industrial Automation</option>
              <option value="AEROSPACE_WINDTUNNEL">Aerospace Aerodynamics & Wind Tunnel</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-foreground">WebXR Scene URL / Canvas Bundle:</label>
            <input
              type="url"
              placeholder="https://scenes.rkvnexus.edu/optics-lab"
              value={vrSceneUrl}
              onChange={(e) => setVrSceneUrl(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">Allotted Duration (Minutes):</label>
            <input
              type="number"
              min="15"
              max="180"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 45)}
              className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-foreground">Experimental Protocol & Rubric Description:</label>
          <textarea
            rows={3}
            placeholder="Specify steps, safety precautions, calibration thresholds, and expected precision tolerances..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center space-x-2 transition-colors shadow-sm"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <PlusCircle className="w-4 h-4" />
          )}
          <span>{loading ? 'Deploying Scene...' : 'Publish VR Scene to Exam Portal'}</span>
        </button>
      </form>
    </div>
  );
}

export default VRLabSetup;
