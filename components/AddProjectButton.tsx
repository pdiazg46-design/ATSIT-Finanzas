'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ProjectModal from './ProjectModal';

export default function AddProjectButton({ employees }: { employees: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
                <Plus size={20} />
                Nuevo proyecto
            </button>

            {isOpen && (
                <ProjectModal
                    employees={employees}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
