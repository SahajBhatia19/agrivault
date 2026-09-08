'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import TechnicalHonestyAlert from '@/components/common/TechnicalHonestyAlert';
import { Cpu, Plus, Wifi, RefreshCw, Key, ShieldCheck } from 'lucide-react';

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newDeviceName, setNewDeviceName] = useState<string>('');

  const fetchDevices = () => {
    fetch('/api/devices')
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) setDevices(data.devices);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeviceName }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewDeviceName('');
        fetchDevices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          <TechnicalHonestyAlert
            title="HARDWARE TECHNICAL HONESTY NOTICE"
            message="Hardware sensors are not required to run AgriVault. Telemetry can be sent over REST API by physical ESP32 microcontrollers or simulated directly within the app."
            variant="info"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                IOT HARDWARE NODES
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">ESP32 Telemetry Device Management</h1>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              Register ESP32 Device Node
            </button>
          </div>

          {/* API CONTRACT CARDS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" />
              ESP32 HARDWARE REST API TELEMETRY CONTRACT
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
              <div className="text-emerald-400 font-bold">POST /api/devices/telemetry</div>
              <pre className="text-slate-400 text-[11px]">
{`{
  "deviceId": "ESP32-WH-01",
  "batchId": "ON-2026-00125",
  "temperature": 26.5,
  "humidity": 82.0,
  "apiKey": "agri_esp32_secret_key_88921"
}`}
              </pre>
            </div>
          </div>

          {/* Devices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <div key={device.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <Wifi className="w-3 h-3 animate-pulse" />
                    {device.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-100">{device.name}</h4>
                  <span className="text-xs font-mono text-slate-400">{device.id}</span>
                </div>

                <div className="space-y-1 text-xs pt-2 border-t border-slate-800 text-slate-400">
                  <div className="flex justify-between">
                    <span>Assigned Batch:</span>
                    <span className="font-mono text-emerald-400">{device.assignedBatchId || 'ON-2026-00125'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Key:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[120px]">{device.apiKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Telemetry:</span>
                    <span>Just now</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal for Registering Device */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleCreateDevice} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
                <h3 className="text-base font-bold text-slate-100">Register ESP32 Hardware Node</h3>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Device Node Name</label>
                  <input
                    type="text"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    placeholder="e.g. Storage Bay B Sensor Node"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                    Generate Credentials & Register Node
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
