"use client";

import { useState } from 'react';
import AddTaskModal from './AddTaskModal';
import { Plus } from 'lucide-react';

export default function AddTaskButton({
    projectId,
    employees,
    movements,
    documents
}: {
    projectId: number,
    employees: any[],
    movements: any[],
    documents: any[]
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            >
                <Plus size={18} />
                Agregar Tarea
            </button>

            {isOpen && (
                <AddTaskModal
                    projectId={projectId}
                    employees={employees}
                    movements={movements}
                    documents={documents}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
