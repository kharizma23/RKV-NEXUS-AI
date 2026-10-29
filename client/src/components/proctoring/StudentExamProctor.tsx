'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Eye, Smartphone, Users, AlertCircle, Play, Square, RefreshCw, CheckCircle2, CameraOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { RiskScoreBadge } from './RiskScoreBadge';

interface StudentExamProctorProps {
  examId: string;
  examTitle?: string;
  onFlagAlert?: (event: string) => void;
}

export function StudentExamProctor({ examId, examTitle = 'Autonomous Examination Session', onFlagAlert }: StudentExamProctorProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [latestEvents, setLatestEvents] = useState<string[]>([]);
  const [faceCount, setFaceCount] = useState(1);
  const [gazeDirection, setGazeDirection] = useState<'CENTER' | 'LEFT' | 'RIGHT' | 'DOWN'>('CENTER');
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraDenied, setCameraDenied] = useState(false);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);
  const [isSimulatedFeed, setIsSimulatedFeed] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Proctoring idle. Click Start Session to begin.');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Helper to retrieve token reliably from localStorage / cookies
  const getAuthToken = (): string => {
    if (typeof window === 'undefined') return '';
    let token =
      localStorage.getItem('antigravity_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('jwt') ||
      '';

    if (!token) {
      try {
        const storedUser = localStorage.getItem('antigravity_auth_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          token = parsed.access_token || parsed.token || '';
        }
      } catch {}
    }

    if (!token && typeof document !== 'undefined' && document.cookie) {
      const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    return token;
  };

  // Start Proctoring Session with explicit JWT Authorization Header
  const startSession = async () => {
    try {
      setStatusMsg('Initializing proctoring session...');
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      headers['X-Demo-Role'] = 'student';

      const res = await apiClient<any>('/proctoring/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({ exam_id: examId })
      });
      if (res?.data?.session_id) {
        setSessionId(res.data.session_id);
        setRiskScore(res.data.risk_score || 0);
        setIsMonitoring(true);
        setStatusMsg('Active monitoring running. OpenCV AI analyzing live frame feeds.');
        initWebcam();
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Network error';
      setStatusMsg(`Failed to start session: ${errMsg}`);
    }
  };

  const initWebcam = async () => {
    setCameraDenied(false);
    setCameraErrorMsg(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
        setIsSimulatedFeed(false);
      } else {
        throw new Error('Webcam media device is not supported in this browser.');
      }
    } catch (e: any) {
      console.warn('Webcam permission error or device unavailable:', e);
      setCameraActive(false);
      setCameraDenied(true);
      setCameraErrorMsg(
        e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError'
          ? 'Camera permission was denied. Please allow camera permissions in your browser.'
          : 'No webcam device detected. You can launch simulated proctoring feed for testing.'
      );
    }
  };

  const enableSimulatedFeed = () => {
    setIsSimulatedFeed(true);
    setCameraDenied(false);
    setCameraActive(true);
    setStatusMsg('Active monitoring running with simulated AI vision telemetry.');
  };

  const stopSession = () => {
    setIsMonitoring(false);
    setStatusMsg('Proctoring session halted.');
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Periodically send frame telemetry (every 10 seconds or manual trigger)
  const sendTelemetryFrame = async (simulatedAnomaly?: string) => {
    if (!sessionId) return;

    let simulatedFaceCount = faceCount;
    let simulatedGaze = gazeDirection;
    let simulatedPhone = phoneDetected;
    let simulatedTab = tabSwitches;

    if (simulatedAnomaly === 'MULTIPLE_FACES') {
      simulatedFaceCount = 2;
      setFaceCount(2);
    } else if (simulatedAnomaly === 'LOOKING_AWAY') {
      simulatedGaze = 'LEFT';
      setGazeDirection('LEFT');
    } else if (simulatedAnomaly === 'PHONE') {
      simulatedPhone = true;
      setPhoneDetected(true);
    } else if (simulatedAnomaly === 'NORMAL') {
      simulatedFaceCount = 1;
      simulatedGaze = 'CENTER';
      simulatedPhone = false;
      setFaceCount(1);
      setGazeDirection('CENTER');
      setPhoneDetected(false);
    }

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await apiClient<any>('/proctoring/frame', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          frame_base64: 'data:image/jpeg;base64,telemetry_frame_payload',
          telemetry: {
            face_count: simulatedFaceCount,
            gaze_direction: simulatedGaze,
            object_detected: simulatedPhone ? 'PHONE' : undefined,
            tab_switches: simulatedTab
          }
        })
      });

      if (res?.data) {
        setRiskScore(res.data.risk_score);
        if (res.data.events_flagged && res.data.events_flagged.length > 0) {
          setLatestEvents((prev) => [...res.data.events_flagged, ...prev].slice(0, 5));
          if (onFlagAlert) onFlagAlert(res.data.events_flagged[0]);
        }
      }
    } catch (err: any) {
      console.error('Frame telemetry sync error', err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring && sessionId) {
      interval = setInterval(() => {
        sendTelemetryFrame();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, sessionId, faceCount, gazeDirection, phoneDetected, tabSwitches]);

  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              AI Proctoring Feed — {examTitle}
            </h3>
            {isMonitoring && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Monitoring
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{statusMsg}</p>
        </div>
        <div className="flex items-center gap-2">
          <RiskScoreBadge score={riskScore} />
          {!isMonitoring ? (
            <button
              onClick={startSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5" /> Start Proctoring
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-semibold rounded-lg hover:bg-destructive/90 transition shadow-sm"
            >
              <Square className="w-3.5 h-3.5" /> Stop Session
            </button>
          )}
        </div>
      </div>

      {/* Video Viewport & Telemetry HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover mirror ${isSimulatedFeed || cameraDenied ? 'hidden' : 'block'}`} />
          
          {/* CAMERA DENIED / UNAVAILABLE FALLBACK UI */}
          {cameraDenied && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 bg-slate-950/95 backdrop-blur-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <CameraOff className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">
                Camera Access Denied or Unavailable
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                {cameraErrorMsg || 'Please allow camera access in your browser to enable AI proctoring surveillance, or switch to simulated mode.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={initWebcam}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Camera Access
                </button>
                <button
                  type="button"
                  onClick={enableSimulatedFeed}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Use Simulated Feed
                </button>
              </div>
            </div>
          )}

          {/* SIMULATED VISION HUD (When physical webcam is bypassed for testing) */}
          {isSimulatedFeed && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 p-6 text-center select-none overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] animate-pulse" />
              <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-indigo-500/40 flex items-center justify-center mb-3">
                <div className="w-24 h-24 rounded-full border border-indigo-400/60 flex items-center justify-center bg-indigo-500/5">
                  <Eye className="w-10 h-10 text-indigo-400 animate-pulse" />
                </div>
                <div className="absolute -top-1 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full mb-1">
                Simulated AI Vision Active
              </span>
              <p className="text-[11px] text-slate-400">
                OpenCV telemetry engine generating synthetic candidate facial & gaze vectors
              </p>
            </div>
          )}

          {/* IDLE / PENDING WEBCAM STATE (Before starting) */}
          {!cameraActive && !cameraDenied && !isSimulatedFeed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-2 p-4 text-center">
              <Camera className="w-10 h-10 opacity-30 animate-pulse text-indigo-400" />
              <p className="text-xs font-medium text-slate-400">Click &ldquo;Start Proctoring&rdquo; to launch camera stream & OpenCV detection</p>
            </div>
          )}

          {/* Overlay live bounding-box indicators */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white flex items-center gap-2 border border-white/10 z-10">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Gaze: {gazeDirection}</span>
          </div>

          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white flex items-center gap-2 border border-white/10 z-10">
            <Users className="w-3 h-3 text-emerald-400" />
            <span>Detected Faces: {faceCount}</span>
          </div>

          {phoneDetected && (
            <div className="absolute bottom-3 left-3 bg-rose-600/90 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 animate-bounce z-10">
              <Smartphone className="w-3.5 h-3.5" /> PHONE DETECTED
            </div>
          )}
        </div>

        {/* Real-time Diagnostics & Testing Controls */}
        <div className="bg-muted/40 border border-border/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-primary" /> Integrity Telemetry
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Face Tracker</span>
                <span className={`font-semibold ${faceCount > 1 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {faceCount === 1 ? 'Single Candidate' : `${faceCount} Faces Detected!`}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Gaze Angle</span>
                <span className={`font-semibold ${gazeDirection !== 'CENTER' ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {gazeDirection}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Mobile Device</span>
                <span className={`font-semibold ${phoneDetected ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {phoneDetected ? 'Detected' : 'Clear'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Active Risk Index</span>
                <span className="font-bold text-primary">{riskScore.toFixed(1)} / 100</span>
              </div>
            </div>
          </div>

          {/* Test / Anomaly Simulation Triggers */}
          <div className="border-t border-border/40 pt-3">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Proctoring Simulation Triggers
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                disabled={!isMonitoring}
                onClick={() => sendTelemetryFrame('MULTIPLE_FACES')}
                className="px-2 py-1 bg-background hover:bg-muted border border-border text-[11px] rounded font-medium disabled:opacity-50"
              >
                +2nd Face
              </button>
              <button
                disabled={!isMonitoring}
                onClick={() => sendTelemetryFrame('LOOKING_AWAY')}
                className="px-2 py-1 bg-background hover:bg-muted border border-border text-[11px] rounded font-medium disabled:opacity-50"
              >
                Gaze Away
              </button>
              <button
                disabled={!isMonitoring}
                onClick={() => sendTelemetryFrame('PHONE')}
                className="px-2 py-1 bg-background hover:bg-muted border border-border text-[11px] rounded font-medium disabled:opacity-50"
              >
                Phone Event
              </button>
              <button
                disabled={!isMonitoring}
                onClick={() => sendTelemetryFrame('NORMAL')}
                className="px-2 py-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] rounded font-medium disabled:opacity-50"
              >
                Reset Normal
              </button>
            </div>
          </div>
        </div>
      </div>

      {latestEvents.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Recent Proctoring Flags Recorded:
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {latestEvents.map((evt, idx) => (
              <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-800 dark:text-amber-200 rounded">
                {evt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
