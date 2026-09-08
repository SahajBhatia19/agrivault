'use client';

import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Zap,
  Filter,
  Check,
  Cpu,
} from 'lucide-react';
import TechnicalHonestyAlert from '@/components/common/TechnicalHonestyAlert';
import { DetectionResult, AnalysisResponse } from '@/lib/ai/vision-engine';

interface Props {
  batchId: string;
  batchDetails?: any;
  onInspectionSaved?: (result: any) => void;
}

export default function OnionInspectionStudio({ batchId, batchDetails, onInspectionSaved }: Props) {
  // Camera & Image State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // AI & Inspection State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [selectedOnion, setSelectedOnion] = useState<DetectionResult | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ACCEPTABLE' | 'LOWER_GRADE' | 'REJECT'>('ALL');
  const [removedOnionIds, setRemovedOnionIds] = useState<Set<string>>(new Set());
  
  // Rescan Flow State
  const [isRescanMode, setIsRescanMode] = useState<boolean>(false);
  const [initialRejectCount, setInitialRejectCount] = useState<number>(0);
  const [rescanResult, setRescanResult] = useState<AnalysisResponse | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isSavingGrade, setIsSavingGrade] = useState<boolean>(false);
  const [gradeSavedMessage, setGradeSavedMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize browser camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera unavailable. Using image upload fallback below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUri);
      stopCamera();
      runAIAnalysis(dataUri, isRescanMode);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setCapturedImage(dataUri);
        stopCamera();
        runAIAnalysis(dataUri, isRescanMode);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Analysis API
  const runAIAnalysis = async (imageData: string, rescan: boolean = false) => {
    setIsAnalyzing(true);
    setGradeSavedMessage(null);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          isRescan: rescan,
          previousRejectIds: Array.from(removedOnionIds),
        }),
      });

      const data: AnalysisResponse = await res.json();
      setIsAnalyzing(false);

      if (rescan) {
        setRescanResult(data);
        const currentRejects = data.summary.reject;
        if (currentRejects === 0 || removedOnionIds.size >= initialRejectCount) {
          setIsVerified(true);
        }
      } else {
        setAnalysisResult(data);
        setInitialRejectCount(data.summary.reject);
      }
    } catch (err) {
      setIsAnalyzing(false);
      console.error('AI Analysis failed:', err);
    }
  };

  // Generate Batch Grade & Save to Database
  const handleSaveBatchGrade = async () => {
    const currentData = isRescanMode && rescanResult ? rescanResult : analysisResult;
    if (!currentData) return;

    setIsSavingGrade(true);
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId,
          inspectionType: isRescanMode ? 'RESCAN' : 'INITIAL',
          imageUrl: capturedImage || '/demo-onion-sample.jpg',
          detections: currentData.detections,
          inspectorName: 'AI Camera System',
          aiMode: currentData.aiMode,
        }),
      });

      const data = await res.json();
      setIsSavingGrade(false);
      if (data.success) {
        setGradeSavedMessage(`Batch Grade ${data.grade} saved to PostgreSQL database! Quality Score: ${data.qualityScore}/100`);
        if (onInspectionSaved) onInspectionSaved(data);
      }
    } catch (err) {
      setIsSavingGrade(false);
      console.error(err);
    }
  };

  // Toggle Mark Removed for Human Operator
  const toggleMarkRemoved = (onionId: string) => {
    const next = new Set(removedOnionIds);
    if (next.has(onionId)) {
      next.delete(onionId);
    } else {
      next.add(onionId);
    }
    setRemovedOnionIds(next);
  };

  const markAllRejectRemoved = () => {
    const currentDetections = analysisResult?.detections || [];
    const rejects = currentDetections.filter((d) => d.category === 'REJECT');
    const next = new Set(removedOnionIds);
    rejects.forEach((r) => next.add(r.id));
    setRemovedOnionIds(next);
  };

  const startRescanFlow = () => {
    setIsRescanMode(true);
    setCapturedImage(null);
    setRescanResult(null);
    startCamera();
  };

  const activeResult = isRescanMode && rescanResult ? rescanResult : analysisResult;
  const currentDetections = activeResult?.detections || [];

  // Filter detections by category filter
  const filteredDetections = currentDetections.filter((d) => {
    if (categoryFilter === 'ALL') return true;
    return d.category === categoryFilter;
  });

  const rejectDetections = currentDetections.filter((d) => d.category === 'REJECT');

  return (
    <div className="space-y-6">
      {/* Technical Honesty Banner */}
      <TechnicalHonestyAlert
        title="CONTROLLED SINGLE-LAYER INSPECTION WORKFLOW"
        message="AgriVault assesses visible external quality (size, color, rot, sprouting, bruising) for separated onions spread in a single layer. RGB computer vision evaluates external characteristics; internal rot sensing is outside the MVP scope."
        variant="info"
      />

      {/* WOW SPLIT LAYOUT INSPECTION WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT WORKSPACE: CAMERA & IMAGE BOUNDING BOX PREVIEW (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              CAMERA WORKSPACE & INDIVIDUAL DETECTION CANVAS
            </h3>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {activeResult?.aiMode === 'REAL_YOLO' ? 'YOLOv8 Production Model' : 'Demo AI Mode'}
              </span>
            </div>
          </div>

          {/* Detection Category Filter Bar */}
          {activeResult && (
            <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              <span className="text-slate-400 font-medium text-[11px] shrink-0">Filter:</span>
              {[
                { label: 'All (100)', value: 'ALL' },
                { label: 'Acceptable', value: 'ACCEPTABLE' },
                { label: 'Lower Grade', value: 'LOWER_GRADE' },
                { label: 'Reject', value: 'REJECT' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setCategoryFilter(f.value as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all whitespace-nowrap ${
                    categoryFilter === f.value
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Camera / Image Container */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group">
            {cameraActive && !capturedImage && (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}

            {capturedImage && (
              <div className="relative w-full h-full">
                <img src={capturedImage} alt="Onion inspection sample" className="w-full h-full object-cover" />

                {/* Bounding Boxes */}
                {activeResult && (
                  <div className="absolute inset-0 pointer-events-auto">
                    {filteredDetections.map((d) => {
                      const isRemoved = removedOnionIds.has(d.id);
                      let borderColor = 'border-emerald-500 bg-emerald-500/10';
                      if (d.category === 'LOWER_GRADE') borderColor = 'border-amber-500 bg-amber-500/15';
                      if (d.category === 'REJECT') borderColor = 'border-rose-500 bg-rose-500/25';

                      if (isRemoved) {
                        borderColor = 'border-slate-500/40 bg-slate-950/60 opacity-30 line-through';
                      }

                      return (
                        <button
                          key={d.id}
                          onClick={() => setSelectedOnion(d)}
                          style={{
                            left: `${d.bbox.x}%`,
                            top: `${d.bbox.y}%`,
                            width: `${d.bbox.width}%`,
                            height: `${d.bbox.height}%`,
                          }}
                          className={`absolute border-2 rounded-md transition-all hover:scale-110 hover:z-20 cursor-pointer flex items-center justify-center shadow-lg ${borderColor}`}
                          title={`Onion #${d.onionIndex}: ${d.category} (${d.defectType})`}
                        >
                          <span className="text-[9px] font-mono font-bold px-1 bg-slate-950/80 text-white rounded opacity-80 group-hover:opacity-100">
                            #{d.onionIndex}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!cameraActive && !capturedImage && (
              <div className="text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center mx-auto shadow-inner">
                  <Camera className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Open Camera or Upload Sample Photo</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Spread representative sample in a single layer.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                    Open Camera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-medium text-xs flex items-center gap-1.5 border border-slate-700"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </button>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-xs font-bold text-white">AI Vision Model Analyzing Individual Onions...</span>
              </div>
            )}
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            {cameraActive && !capturedImage && (
              <button
                onClick={capturePhoto}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
              >
                <Zap className="w-4 h-4" />
                Capture & Run AI Vision Analysis
              </button>
            )}

            {capturedImage && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    startCamera();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake Photo
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Image
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT WORKSPACE: AI RESULTS, SORTING & GRADE GENERATOR (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quality Score & Grade Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              QUALITY SCORE & BATCH GRADE
            </h3>

            {activeResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Quality Score</span>
                    <span className="text-3xl font-mono font-bold text-emerald-400">{activeResult.summary.qualityScore} / 100</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Batch Grade</span>
                    <span className="px-3 py-1 rounded-lg font-black text-xl bg-emerald-600 text-white inline-block">
                      Grade {activeResult.summary.grade}
                    </span>
                  </div>
                </div>

                {/* Summary Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block">Acceptable</span>
                    <span className="font-mono font-bold text-emerald-400">{activeResult.summary.acceptable} ({Math.round(activeResult.summary.acceptable)}%)</span>
                  </div>
                  <div className="bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40">
                    <span className="text-[9px] uppercase font-bold text-amber-400 block">Lower Grade</span>
                    <span className="font-mono font-bold text-amber-400">{activeResult.summary.lowerGrade} ({Math.round(activeResult.summary.lowerGrade)}%)</span>
                  </div>
                  <div className="bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40">
                    <span className="text-[9px] uppercase font-bold text-rose-400 block">Reject</span>
                    <span className="font-mono font-bold text-rose-400">{activeResult.summary.reject} ({Math.round(activeResult.summary.reject)}%)</span>
                  </div>
                </div>

                {/* Generate Batch Grade Button */}
                <button
                  onClick={handleSaveBatchGrade}
                  disabled={isSavingGrade}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
                >
                  {isSavingGrade ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  GENERATE & SAVE BATCH GRADE TO DB
                </button>

                {gradeSavedMessage && (
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{gradeSavedMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs space-y-1">
                <p>Run camera acquisition or upload image to generate batch quality score and grade.</p>
              </div>
            )}
          </div>

          {/* HUMAN SORTING ASSISTANCE CHECKLIST */}
          {rejectDetections.length > 0 && !isVerified && (
            <div className="bg-slate-900 border border-rose-900/60 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-rose-200 uppercase tracking-wider">
                    HUMAN SORTING ASSISTANCE: MARK REMOVED
                  </h3>
                </div>
                <button
                  onClick={markAllRejectRemoved}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800"
                >
                  Mark All Removed
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {rejectDetections.map((onion) => {
                  const isRemoved = removedOnionIds.has(onion.id);

                  return (
                    <button
                      key={onion.id}
                      onClick={() => toggleMarkRemoved(onion.id)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                        isRemoved
                          ? 'bg-slate-950 border-slate-800 text-slate-500 line-through opacity-50'
                          : 'bg-rose-950/40 border-rose-800 text-rose-200'
                      }`}
                    >
                      <span className="font-mono font-bold">Onion #{onion.onionIndex}</span>
                      {isRemoved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={startRescanFlow}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <RefreshCw className="w-4 h-4" />
                RESCAN SAMPLE & VERIFY SORTING
              </button>
            </div>
          )}

          {isVerified && (
            <div className="bg-emerald-950/50 border border-emerald-600 rounded-2xl p-5 text-center space-y-2 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-widest">SORTING VERIFIED</h4>
              <p className="text-xs text-emerald-200/90">
                Rejected onions physically removed. Sample sorting verified.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* INDIVIDUAL ONION DETAIL MODAL */}
      {selectedOnion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <button onClick={() => setSelectedOnion(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-white text-sm shadow ${selectedOnion.category === 'REJECT' ? 'bg-rose-600' : selectedOnion.category === 'LOWER_GRADE' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                #{selectedOnion.onionIndex}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Individual Onion #{selectedOnion.onionIndex}</h3>
                <span className="text-xs text-slate-400">YOLO Visible External Quality Assessment</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Classification</span>
                <span className={`font-bold uppercase ${selectedOnion.category === 'REJECT' ? 'text-rose-400' : selectedOnion.category === 'LOWER_GRADE' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedOnion.category}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Visible Defect</span>
                <span className="font-semibold text-slate-200 capitalize">{selectedOnion.defectType.replace('_', ' ').toLowerCase()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Approximate Size</span>
                <span className="font-semibold text-slate-200">Medium (55-65mm)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Color Profile</span>
                <span className="font-semibold text-slate-200">Red Globe Scale</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Model Confidence</span>
                <span className="font-mono font-bold text-emerald-400">{Math.round(selectedOnion.confidence * 100)}%</span>
              </div>
            </div>

            <button onClick={() => setSelectedOnion(null)} className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs">
              Close Inspection Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
