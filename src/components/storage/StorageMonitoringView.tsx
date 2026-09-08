'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { Thermometer, Droplets, ShieldAlert, Cpu, Play, RefreshCw, CheckCircle2 } from 'lucide-react';
import TechnicalHonestyAlert from '@/components/common/TechnicalHonestyAlert';

interface Props {
  batchId: string;
  batchData?: any;
  onSimulateReading?: (temp: number, humidity: number) => void;
}

export default function StorageMonitoringView({ batchId, batchData, onSimulateReading }: Props) {
  const [simTemp, setSimTemp] = useState<number>(26.5);
  const [simHumidity, setSimHumidity] = useState<number>(82.0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  // Time-series sample data for main demo batch ON-2026-00125
  const telemetryData = [
    { day: 'Day 1', temp: 20.2, humidity: 62.0, risk: 28, quality: 78 },
    { day: 'Day 3', temp: 21.0, humidity: 64.0, risk: 32, quality: 78 },
    { day: 'Day 6', temp: 22.5, humidity: 68.0, risk: 45, quality: 77 },
    { day: 'Day 9', temp: 24.8, humidity: 76.5, risk: 63, quality: 75 },
    { day: 'Day 14 (Now)', temp: 26.5, humidity: 82.0, risk: 78, quality: 72 },
  ];

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimMessage(null);

    try {
      const res = await fetch('/api/devices/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'ESP32-WH-01',
          batchId,
          temperature: simTemp,
          humidity: simHumidity,
          source: 'SIMULATION',
        }),
      });

      const data = await res.json();
      setIsSimulating(false);
      if (data.success) {
        setSimMessage(`Telemetry logged! Recalculated Risk Score: ${data.riskAssessment.riskScore}/100 (${data.riskAssessment.riskLevel} RISK)`);
        if (onSimulateReading) {
          onSimulateReading(simTemp, simHumidity);
        }
      }
    } catch (err: any) {
      setIsSimulating(false);
      setSimMessage('Simulation request error');
    }
  };

  return (
    <div className="space-y-6">
      <TechnicalHonestyAlert
        title="STORAGE TELEMETRY & HARDWARE INTEGRATION"
        message="Storage metrics can be ingested automatically via ESP32 microcontrollers over REST/MQTT or simulated using the judge simulation panel below."
        variant="info"
      />

      {/* Main Monitoring Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-emerald-400" />
              STORAGE ENVIRONMENTAL TELEMETRY & CHARTS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Assigned Location: Storage Bay B (Ventilated Ambient Storage)
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-medium">Node: ESP32-WH-01 (ONLINE)</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span>Temperature</span>
            </div>
            <span className="text-2xl font-mono font-bold text-slate-100 mt-1 block">26.5 °C</span>
            <span className="text-[10px] text-amber-400 font-semibold block">+2.5° above target (24°C)</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span>Relative Humidity</span>
            </div>
            <span className="text-2xl font-mono font-bold text-rose-400 mt-1 block">82.0 % RH</span>
            <span className="text-[10px] text-rose-400 font-semibold block">+17% above rot threshold</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Storage Duration</span>
            </div>
            <span className="text-2xl font-mono font-bold text-slate-100 mt-1 block">14 Days</span>
            <span className="text-[10px] text-slate-400 block">Registered 14d ago</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Current Risk</span>
            </div>
            <span className="text-2xl font-mono font-bold text-rose-400 mt-1 block">78 / 100</span>
            <span className="text-[10px] text-rose-400 font-bold uppercase block">HIGH RISK</span>
          </div>
        </div>

        {/* Time Series Recharts Graph */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-900">
            <span className="font-bold text-slate-200">Environmental Exposure & Risk Progression Over Time</span>
            <span className="text-[10px] text-slate-500 font-mono">14-Day History</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData}>
                <defs>
                  <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="humidity" name="Humidity (% RH)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHumidity)" strokeWidth={2} />
                <Area type="monotone" dataKey="risk" name="Risk Score (0-100)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DEMO TELEMETRY SIMULATOR PANEL */}
        <div className="bg-slate-950 border border-emerald-900/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>JUDGE TELEMETRY SIMULATOR PANEL</span>
          </div>
          <p className="text-xs text-slate-400">
            Simulate changing humidity and temperature parameters to test live Risk Engine progression.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Simulate Humidity (% RH)</label>
              <input
                type="number"
                value={simHumidity}
                onChange={(e) => setSimHumidity(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Simulate Temperature (°C)</label>
              <input
                type="number"
                value={simTemp}
                onChange={(e) => setSimTemp(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Submit Simulated Telemetry & Re-run Risk Engine
          </button>

          {simMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{simMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
