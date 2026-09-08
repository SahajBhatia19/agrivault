'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import RepresentativeSamplingWizard from '@/components/inspection/RepresentativeSamplingWizard';
import OnionInspectionStudio from '@/components/inspection/OnionInspectionStudio';
import { QRCodeSVG } from 'qrcode.react';
import { PlusCircle, Layers, CheckCircle2, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function NewBatchWizardPage() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    crop: 'ONION',
    variety: 'Nashik Red Globe',
    quantityKg: 500,
    estimatedUnitValue: 100,
    sourceLocation: 'Lasalgaon Farm Cluster',
    procurementLocation: 'Lasalgaon Mandi, Nashik',
  });

  const [createdBatch, setCreatedBatch] = useState<any>(null);
  const [samplingData, setSamplingData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 1 Submit: Create Batch Record in DB
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setCreatedBatch(data.batch);
        setStep(2); // Move to Batch ID & QR step
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('Batch creation error:', err);
    }
  };

  const handleSamplingConfirmed = async (sampling: any) => {
    setSamplingData(sampling);
    if (createdBatch) {
      try {
        await fetch(`/api/batches/${createdBatch.id}/samples`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sampling),
        });
      } catch (err) {
        console.warn('Sample logging warning:', err);
      }
    }
    setStep(4); // Move to Camera Inspection step
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Header & Step Wizard Indicator */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                BATCH PROCUREMENT WORKFLOW
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Register & Inspect New Batch</h1>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold pt-2">
              <div className={`p-2.5 rounded-lg border text-center transition-all ${step >= 1 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                1. Batch Details
              </div>
              <div className={`p-2.5 rounded-lg border text-center transition-all ${step >= 2 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                2. QR Passport
              </div>
              <div className={`p-2.5 rounded-lg border text-center transition-all ${step >= 3 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                3. Sampling
              </div>
              <div className={`p-2.5 rounded-lg border text-center transition-all ${step >= 4 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                4. AI Inspection
              </div>
            </div>
          </div>

          {/* STEP 1: BATCH DETAILS FORM */}
          {step === 1 && (
            <form onSubmit={handleCreateBatch} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
              <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
                STEP 1: PROCUREMENT BATCH SPECIFICATIONS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Crop Type</label>
                  <select
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ONION">Onion (Primary Supported Crop)</option>
                    <option value="POTATO">Potato (Extensible Architecture)</option>
                    <option value="GARLIC">Garlic (Extensible Architecture)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Onion Variety</label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Total Batch Quantity (kg)</label>
                  <input
                    type="number"
                    value={formData.quantityKg}
                    onChange={(e) => setFormData({ ...formData, quantityKg: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Estimated Unit Value (₹ / kg)</label>
                  <input
                    type="number"
                    value={formData.estimatedUnitValue}
                    onChange={(e) => setFormData({ ...formData, estimatedUnitValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Farm / Source Location</label>
                  <input
                    type="text"
                    value={formData.sourceLocation}
                    onChange={(e) => setFormData({ ...formData, sourceLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Procurement Mandi / Yard</label>
                  <input
                    type="text"
                    value={formData.procurementLocation}
                    onChange={(e) => setFormData({ ...formData, procurementLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950"
                >
                  Generate Batch ID & QR Passport
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: GENERATED BATCH ID & QR PASSPORT */}
          {step === 2 && createdBatch && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 text-center shadow-xl">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                  BATCH SUCCESSFULLY REGISTERED
                </span>
                <h2 className="text-3xl font-black font-mono text-white mt-1">{createdBatch.id}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  {createdBatch.quantityKg} kg {createdBatch.variety} • Total Value: ₹{createdBatch.totalBatchValue.toLocaleString()}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 max-w-xs mx-auto space-y-3 shadow-inner">
                <QRCodeSVG
                  value={`https://agrivault.ai/batches/${createdBatch.id}/passport`}
                  size={140}
                  bgColor="transparent"
                  fgColor="#10b981"
                  className="mx-auto"
                />
                <span className="text-[10px] font-mono text-slate-400 block">Scan to view Digital Batch Passport</span>
              </div>

              <button
                onClick={() => setStep(3)}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto shadow-lg shadow-emerald-950"
              >
                Proceed to Representative Sampling
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: REPRESENTATIVE SAMPLING SELECTION */}
          {step === 3 && (
            <RepresentativeSamplingWizard
              batchQuantityKg={formData.quantityKg}
              onProceedToCamera={handleSamplingConfirmed}
            />
          )}

          {/* STEP 4: AI INSPECTION STUDIO */}
          {step === 4 && createdBatch && (
            <div className="space-y-6">
              <OnionInspectionStudio batchId={createdBatch.id} />

              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Step 4 Complete: Initial Batch Inspection Captured</span>
                <Link
                  href={`/batches/${createdBatch.id}/passport`}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow"
                >
                  View Digital Batch Passport →
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
