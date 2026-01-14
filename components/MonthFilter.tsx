'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

export default function MonthFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentMonth = searchParams.get('month') || new Date().toISOString().slice(0, 7); // YYYY-MM

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (newValue) {
            params.set('month', newValue);
        } else {
            params.delete('month');
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
            <Calendar size={18} className="text-slate-400" />
            <input
                type="month"
                value={currentMonth}
                onChange={handleChange}
                className="bg-transparent border-none text-white focus:ring-0 text-sm [&::-webkit-calendar-picker-indicator]:invert"
            />
        </div>
    );
}
