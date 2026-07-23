'use client';

import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const ZOOM_LEVELS = [0.75, 0.85, 1.0, 1.1, 1.25];

export default function ZoomControls() {
    const [zoomLevel, setZoomLevel] = useState(0.85);

    useEffect(() => {
        // Load saved zoom or default to 85% (0.85)
        const savedZoom = localStorage.getItem('atsit_zoom_level');
        const initialZoom = savedZoom ? parseFloat(savedZoom) : 0.85;
        applyZoom(initialZoom);
    }, []);

    const applyZoom = (level: number) => {
        const rounded = Math.round(level * 100) / 100;
        setZoomLevel(rounded);
        localStorage.setItem('atsit_zoom_level', rounded.toString());

        // Apply to document style zoom
        (document.body.style as any).zoom = rounded;
    };

    const handleZoomIn = () => {
        const currentIndex = ZOOM_LEVELS.findIndex(z => z >= zoomLevel);
        const nextIndex = Math.min(ZOOM_LEVELS.length - 1, (currentIndex < 0 ? 1 : currentIndex) + 1);
        applyZoom(ZOOM_LEVELS[nextIndex]);
    };

    const handleZoomOut = () => {
        const currentIndex = ZOOM_LEVELS.findIndex(z => z >= zoomLevel);
        const prevIndex = Math.max(0, (currentIndex < 0 ? 1 : currentIndex) - 1);
        applyZoom(ZOOM_LEVELS[prevIndex]);
    };

    const handleReset = () => {
        applyZoom(0.85);
    };

    return (
        <div className="flex items-center gap-1.5 bg-slate-950/70 border border-white/10 p-1 rounded-xl text-xs shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1.5 hidden md:inline">
                Zoom
            </span>
            <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="Alejar (Ctrl -)"
            >
                <ZoomOut size={14} />
            </button>

            <select
                value={zoomLevel}
                onChange={(e) => applyZoom(parseFloat(e.target.value))}
                className="bg-transparent text-amber-300 font-mono font-bold text-xs focus:outline-none cursor-pointer px-1 text-center"
            >
                <option value={0.75} className="bg-slate-900 text-white">75%</option>
                <option value={0.85} className="bg-slate-900 text-white">85% (Recomendado)</option>
                <option value={1.0} className="bg-slate-900 text-white">100%</option>
                <option value={1.1} className="bg-slate-900 text-white">110%</option>
                <option value={1.25} className="bg-slate-900 text-white">125%</option>
            </select>

            <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="Acercar (Ctrl +)"
            >
                <ZoomIn size={14} />
            </button>

            <button
                type="button"
                onClick={handleReset}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Restablecer (85%)"
            >
                <RotateCcw size={12} />
            </button>
        </div>
    );
}
