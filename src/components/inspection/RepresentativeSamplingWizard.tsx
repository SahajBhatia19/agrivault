'use client';

import React, { useState } from 'react';
import { Layers, HelpCircle, Check, ArrowRight } from 'lucide-react';
import TechnicalHonestyAlert from '@/components/common/TechnicalHonestyAlert';

interface Props {
  batchQuantityKg?: number;
  onProceedToCamera: (samplingData: any) => void;
}

export default function RepresentativeSamplingWizard({
  batchQuantityKg = 500,
  onProceedToCamera,
}: Props) {
  const [sampleSize, setSampleSize] = useState<number>(100);
  const [locations, setLocations] = useState({
    sampledTop: true,
    sampledMiddle: true,
    sampledLeftSide: true,
    sampledRightSide: true,
    sampledLower: true,
  });

  const toggleLocation = (key: keyof typeof locations) => {
    setLocations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProceed = () => {
    onProceedToCamera({
      sampleSize,
      ...locations,
    });
  };

  return (
    <div className="space-y-6">
      <TechnicalHonestyAlert
        title="REPRESENTATIVE SAMPLING METHODOLOGY"
        message="A piled onion cart cannot be completely inspected visually from one photograph because onions underneath are obscured. AgriVault requires representative sampling across multiple cart depth zones to generate an accurate batch-level quality score."
        variant="info"
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              REPRESENTATIVE SAMPLING SELECTION
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select sampling depth locations drawn from the {batchQuantityKg} kg onion cart.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Target Sample Size:</span>
            <span className="font-mono font-bold text-emerald-400">{sampleSize} Onions</span>
          </div>
        </div>

        {/* Visual Cart Quadrant Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Schematic Diagram of Onion Cart */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-3 relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
              ONION CART DEPTH SCHEMATIC (500 KG BATCH)
            </span>

            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto my-4 text-xs font-semibold">
              <button
                onClick={() => toggleLocation('sampledTop')}
                className={`p-3 rounded-lg border transition-all ${
                  locations.sampledTop
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                Top Zone {locations.sampledTop && '✓'}
              </button>

              <button
                onClick={() => toggleLocation('sampledMiddle')}
                className={`p-3 rounded-lg border transition-all ${
                  locations.sampledMiddle
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                Center Core {locations.sampledMiddle && '✓'}
              </button>

              <button
                onClick={() => toggleLocation('sampledLeftSide')}
                className={`p-3 rounded-lg border transition-all ${
                  locations.sampledLeftSide
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                Left Flank {locations.sampledLeftSide && '✓'}
              </button>

              <button
                onClick={() => toggleLocation('sampledRightSide')}
                className={`p-3 rounded-lg border transition-all ${
                  locations.sampledRightSide
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                Right Flank {locations.sampledRightSide && '✓'}
              </button>

              <button
                onClick={() => toggleLocation('sampledLower')}
                className={`col-span-2 p-3 rounded-lg border transition-all ${
                  locations.sampledLower
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                Lower Portion {locations.sampledLower && '✓'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Click quadrants to record representative sample extraction points.
            </p>
          </div>

          {/* Educational Tooltip & Confirmation */}
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <HelpCircle className="w-4 h-4" />
                <span>Why Representative Sampling?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Representative sampling reduces the need to inspect every onion individually while providing a statistically sound batch-level quality estimate."
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">Sample Size (Onions)</label>
              <div className="flex gap-2">
                {[50, 100, 150, 200].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSampleSize(size)}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                      sampleSize === size
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all mt-4"
            >
              Confirm Representative Sample & Open AI Camera
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
