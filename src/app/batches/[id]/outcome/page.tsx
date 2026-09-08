'use client';

import React, { useState, use } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Award, FileText } from 'lucide-react';

export default function BatchOutcomePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const batchId = resolvedParams.id;

  const [formData, setFormData] = useState({
    actualDefectRate: 8.5,
    finalQualityScore: 76.0,
    quantityLostKg: 42.0,
    finalRealizedValue: 45800,
    aiAccuracyRating: 91.5,
    notes: 'Batch dispatched to Lasalgaon retail network. Actual yield loss closely matched AI risk model prediction.',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedOutcome, setSubmittedOutcome] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/batches/${batchId}/outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setIsSubmitting(false);
      if (data.success) {
        setSubmittedOutcome(data.outcome);
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Link
                href={`/batches/${batchId}/passport`}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  MODEL IMPROVEMENT FEEDBACK LOOP
                </span>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Record Batch Outcome & AI Accuracy ({batchId})
                </h1>
              </div>
            </div>
          </div>

          {!submittedOutcome ? (
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
              <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
                FINAL DISPATCH YIELD & MODEL EVALUATION
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Observed Defect Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.actualDefectRate}
                    onChange={(e) => setFormData({ ...formData, actualDefectRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Final Quality Score (0-100)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.finalQualityScore}
                    onChange={(e) => setFormData({ ...formData, finalQualityScore: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Total Quantity Lost (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.quantityLostKg}
                    onChange={(e) => setFormData({ ...formData, quantityLostKg: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Final Realized Value (₹)</label>
                  <input
                    type="number"
                    value={formData.finalRealizedValue}
                    onChange={(e) => setFormData({ ...formData, finalRealizedValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-300">AI Prediction Accuracy Rating (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.aiAccuracyRating}
                    onChange={(e) => setFormData({ ...formData, aiAccuracyRating: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-300">Operator Outcome Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
              >
                Record Outcome & Save Model Feedback Loop
              </button>
            </form>
          ) : (
            <div className="bg-slate-900 border border-emerald-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center mx-auto text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Batch Outcome Logged Successfully</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Feedback recorded into continuous AI retraining pipeline. Realized Value: ₹{submittedOutcome.finalRealizedValue.toLocaleString()} (AI Accuracy: {submittedOutcome.aiAccuracyRating}%).
              </p>
              <Link
                href={`/batches/${batchId}/passport`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow"
              >
                Return to Digital Batch Passport
              </Link>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
