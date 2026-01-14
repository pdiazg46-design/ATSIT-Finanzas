'use client';

import { useState } from 'react';
import { Edit } from 'lucide-react';
import ProjectModal from './ProjectModal';

export default function EditProjectButton({ project, employees }: { project: any, employees: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            >
                <Edit size={18} />
                Editar Proyecto
            </button>

            {isOpen && (
                <ProjectModal
                    project={project}
                    employees={employees}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
