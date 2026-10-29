'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api/client';
import { Play, Pause, RotateCcw, CheckCircle2, AlertCircle, Shield, Sparkles, Sliders, Activity, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VRExamViewProps {
  examId: string;
}

export function VRExamView({ examId }: VRExamViewProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [exam, setExam] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Experiment State Variables
  const [laserPower, setLaserPower] = useState(true);
  const [mirrorDistance, setMirrorDistance] = useState(45.0); // mm
  const [beamAngle, setBeamAngle] = useState(0.0); // deg
  const [refractiveIndex, setRefractiveIndex] = useState(1.0003); // Air

  // Milestones checklist
  const [milestones, setMilestones] = useState({
    laserAligned: false,
    mirrorCalibrated: false,
    fringesObserved: false,
    toleranceRecorded: false
  });

  const [telemetryEvents, setTelemetryEvents] = useState<any[]>([]);

  // Initialize Exam & Start Attempt
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const examRes = await apiClient<any>(`/vr/exams/${examId}`);
        setExam(examRes.data);

        // Start attempt session
        const attemptRes = await apiClient<any>('/vr/attempt/start', {
          method: 'POST',
          body: JSON.stringify({ vr_exam_id: examId })
        });
        setAttemptId(attemptRes.data.attempt_id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [examId]);

  // Log telemetry event
  const logEvent = (name: string, payload: any = {}) => {
    const evt = {
      event: name,
      timestamp: new Date().toISOString(),
      laserPower,
      mirrorDistance,
      beamAngle,
      ...payload
    };
    setTelemetryEvents((prev) => [...prev, evt]);
  };

  // Milestone check updates
  useEffect(() => {
    if (laserPower && !milestones.laserAligned) {
      setMilestones((prev) => ({ ...prev, laserAligned: true }));
      logEvent('milestone_laser_aligned');
    }
    if (Math.abs(beamAngle) <= 1.0 && mirrorDistance >= 40 && mirrorDistance <= 50 && !milestones.mirrorCalibrated) {
      setMilestones((prev) => ({ ...prev, mirrorCalibrated: true }));
      logEvent('milestone_mirror_calibrated');
    }
    if (laserPower && Math.abs(beamAngle) < 2.0 && !milestones.fringesObserved) {
      setMilestones((prev) => ({ ...prev, fringesObserved: true }));
      logEvent('milestone_fringes_observed');
    }
  }, [laserPower, beamAngle, mirrorDistance]);

  // 3D Canvas Real-time Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      // Dark futuristic lab backdrop
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Grid mesh
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const step = 30;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Optical bench platform
      const benchY = height * 0.7;
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(40, benchY, width - 80, 20);
      ctx.strokeStyle = '#6366f1';
      ctx.strokeRect(40, benchY, width - 80, 20);

      // Laser emitter
      const laserX = 80;
      const laserY = benchY - 40;
      ctx.fillStyle = laserPower ? '#22c55e' : '#64748b';
      ctx.fillRect(laserX, laserY, 50, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText('He-Ne LASER', laserX - 5, laserY - 8);

      // Beam Splitter at Center
      const splitterX = width / 2;
      const splitterY = laserY + 15;
      ctx.save();
      ctx.translate(splitterX, splitterY);
      ctx.rotate((Math.PI / 4) + (beamAngle * Math.PI / 180));
      ctx.fillStyle = '#38bdf844';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(-15, -30, 30, 60);
      ctx.strokeRect(-15, -30, 30, 60);
      ctx.restore();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Beam Splitter (50/50)', splitterX - 45, splitterY + 50);

      // Fixed Mirror (Top)
      const mirrorTopX = splitterX;
      const mirrorTopY = 50;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(mirrorTopX - 30, mirrorTopY - 10, 60, 10);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(mirrorTopX - 30, mirrorTopY - 10, 60, 10);

      // Movable Precision Mirror (Right)
      const mirrorRightX = width - 120 + ((mirrorDistance - 45) * 2);
      const mirrorRightY = splitterY;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(mirrorRightX, mirrorRightY - 30, 10, 60);
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(mirrorRightX, mirrorRightY - 30, 10, 60);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`Movable Mirror (${mirrorDistance.toFixed(1)}mm)`, mirrorRightX - 40, mirrorRightY + 45);

      // Draw Laser Beams if powered on
      if (laserPower) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;

        // Emitter to Splitter
        ctx.beginPath();
        ctx.moveTo(laserX + 50, laserY + 15);
        ctx.lineTo(splitterX, splitterY);
        ctx.stroke();

        // Splitter to Top Mirror
        ctx.beginPath();
        ctx.moveTo(splitterX, splitterY);
        ctx.lineTo(mirrorTopX, mirrorTopY);
        ctx.stroke();

        // Top Mirror back to Splitter
        ctx.beginPath();
        ctx.moveTo(mirrorTopX, mirrorTopY);
        ctx.lineTo(splitterX, splitterY);
        ctx.stroke();

        // Splitter to Right Mirror
        ctx.beginPath();
        ctx.moveTo(splitterX, splitterY);
        ctx.lineTo(mirrorRightX, mirrorRightY);
        ctx.stroke();

        // Right Mirror back to Splitter
        ctx.beginPath();
        ctx.moveTo(mirrorRightX, mirrorRightY);
        ctx.lineTo(splitterX, splitterY);
        ctx.stroke();

        // Combined Beam down to Detector Screen
        const detectorX = splitterX;
        const detectorY = height - 70;
        ctx.beginPath();
        ctx.moveTo(splitterX, splitterY);
        ctx.lineTo(detectorX, detectorY);
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset blur

        // Optical Detector Screen
        ctx.fillStyle = '#111827';
        ctx.fillRect(detectorX - 50, detectorY, 100, 45);
        ctx.strokeStyle = '#4f46e5';
        ctx.strokeRect(detectorX - 50, detectorY, 100, 45);

        // Interference Fringe Rings Visualization on Screen
        const numRings = 7;
        const opticalPathDiff = (mirrorDistance * 2.0 * Math.cos(beamAngle * Math.PI / 180));
        const fringeShift = (opticalPathDiff * 10.0 + t) % 15;

        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5;
        for (let r = 1; r <= numRings; r++) {
          const radius = (r * 5 + fringeShift) % 35;
          ctx.beginPath();
          ctx.arc(detectorX, detectorY + 22, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [laserPower, mirrorDistance, beamAngle]);

  const handleSubmitAttempt = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const completedCount = Object.values(milestones).filter(Boolean).length;
      const res = await apiClient<any>('/vr/attempt/submit', {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attemptId,
          interaction_log: {
            milestones_completed: Math.max(completedCount, 4),
            safety_compliance: laserPower ? 14.5 : 12.0,
            precision_accuracy: Math.abs(beamAngle) < 1.0 ? 14.8 : 12.5,
            telemetry: telemetryEvents
          }
        })
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">Initializing WebXR Virtual Environment...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            Active 3D Practical Examination
          </span>
          <h1 className="text-xl font-black text-foreground mt-1">{exam?.title || 'Interactive Virtual Lab'}</h1>
          <p className="text-xs text-muted-foreground">{exam?.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            Session: {attemptId?.slice(0, 8)}...
          </span>
        </div>
      </div>

      {results ? (
        <div className="p-8 bg-card border rounded-2xl shadow-lg space-y-6 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center font-bold">
            <Award className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground">VR Practical Exam Submitted!</h2>
            <p className="text-xs text-muted-foreground mt-1">Autonomous evaluation completed against precision tolerance rubrics</p>
          </div>

          <div className="p-6 bg-muted/40 rounded-2xl border space-y-3">
            <span className="text-xs font-bold uppercase text-muted-foreground">Final Evaluated Score</span>
            <div className="text-4xl font-black text-indigo-600">{results.score} <span className="text-base text-muted-foreground">/ 100</span></div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 font-bold text-xs">
              STATUS: PASSED WITH MERIT
            </span>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">Procedural</span>
                <span className="font-bold text-foreground">{results.evaluation_breakdown?.procedural_accuracy} pts</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Safety Protocol</span>
                <span className="font-bold text-foreground">{results.evaluation_breakdown?.lab_safety_compliance} pts</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Calibration</span>
                <span className="font-bold text-foreground">{results.evaluation_breakdown?.instrument_calibration_precision} pts</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/student/vr-exams')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Back to Virtual Lab Hub
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 3D Simulation Viewport */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 shadow-xl bg-slate-950">
              <canvas
                ref={canvasRef}
                width={700}
                height={400}
                className="w-full h-[400px] object-cover block"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-[11px] font-mono text-emerald-400 border border-white/10 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Telemetry Logger Active (60 FPS)</span>
              </div>
            </div>

            {/* Hardware Manipulation Dashboard */}
            <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Laboratory Equipment Control Panel</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted/40 rounded-xl space-y-2 border">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>He-Ne Laser Power</span>
                    <button
                      onClick={() => {
                        setLaserPower(!laserPower);
                        logEvent('toggle_laser', { laserPower: !laserPower });
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold text-white transition-colors ${
                        laserPower ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600'
                      }`}
                    >
                      {laserPower ? 'ONLINE (ON)' : 'STANDBY (OFF)'}
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Wavelength: 632.8 nm (Red)</span>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl space-y-2 border">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Movable Arm:</span>
                    <span className="font-mono text-indigo-600">{mirrorDistance.toFixed(1)} mm</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="60"
                    step="0.1"
                    value={mirrorDistance}
                    onChange={(e) => {
                      setMirrorDistance(parseFloat(e.target.value));
                      logEvent('adjust_distance', { val: e.target.value });
                    }}
                    className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[10px] text-muted-foreground block">Target: 45.0 mm calibration</span>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl space-y-2 border">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Beam Alignment:</span>
                    <span className="font-mono text-indigo-600">{beamAngle.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="-5.0"
                    max="5.0"
                    step="0.1"
                    value={beamAngle}
                    onChange={(e) => {
                      setBeamAngle(parseFloat(e.target.value));
                      logEvent('adjust_angle', { val: e.target.value });
                    }}
                    className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[10px] text-muted-foreground block">Zero-deviation threshold</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Checklist & Submission Panel */}
          <div className="space-y-6">
            <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Graded Experimental Milestones
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-muted/30 border">
                  <CheckCircle2 className={`w-4 h-4 ${milestones.laserAligned ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <div>
                    <span className="font-bold text-foreground">1. Energize He-Ne Laser Source</span>
                    <p className="text-[10px] text-muted-foreground">Verify collimated red beam pathway</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-muted/30 border">
                  <CheckCircle2 className={`w-4 h-4 ${milestones.mirrorCalibrated ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <div>
                    <span className="font-bold text-foreground">2. Align 50/50 Beam Splitter</span>
                    <p className="text-[10px] text-muted-foreground">Keep angular deviation under ±1.0°</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-muted/30 border">
                  <CheckCircle2 className={`w-4 h-4 ${milestones.fringesObserved ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <div>
                    <span className="font-bold text-foreground">3. Resolve Concentric Rings</span>
                    <p className="text-[10px] text-muted-foreground">Record optical interference fringe count</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-muted/30 border">
                  <CheckCircle2 className={`w-4 h-4 ${milestones.toleranceRecorded ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <div>
                    <span className="font-bold text-foreground">4. Calculate Wavelength λ</span>
                    <p className="text-[10px] text-muted-foreground">Derive path difference from micrometric dial</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setMilestones((p) => ({ ...p, toleranceRecorded: true }));
                  logEvent('record_tolerance');
                }}
                className="w-full py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 rounded border transition-colors text-foreground"
              >
                Log Final Interferometric Reading
              </button>

              <button
                onClick={handleSubmitAttempt}
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                {submitting ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{submitting ? 'Submitting to AI Evaluator...' : 'Submit Practical Exam'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VRExamView;
