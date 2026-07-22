'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ProjectModal from './ProjectModal';

export default function AddProjectButton({ employees, canCreate = false, categories = [], currentUser }: { employees: any[], canCreate?: boolean, categories?: string[], currentUser?: any }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!canCreate) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold"
            >
                <Plus size={20} />
                Nuevo proyecto
            </button>

            {isOpen && (
                <ProjectModal
                    employees={employees}
                    categories={categories}
                    currentUser={currentUser}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
