'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

interface YearFilterProps {
    years: string[];
}

export default function YearFilter({ years }: YearFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentYear = searchParams.get('year') || new Date().getFullYear().toString();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (newValue) {
            params.set('year', newValue);
        } else {
            params.delete('year');
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
            <Calendar size={18} className="text-slate-400" />
            <select
                value={currentYear}
                onChange={handleChange}
                className="bg-transparent border-none text-white focus:ring-0 text-sm [&>option]:bg-slate-900 [&>option]:text-white cursor-pointer outline-none"
            >
                {years.map(y => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );
}
