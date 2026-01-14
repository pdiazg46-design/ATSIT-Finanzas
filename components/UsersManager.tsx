'use client';

import { useState } from 'react';
import { createUser, deleteUser } from '@/lib/user-actions';
// No changes needed here if it doesn't import PERMISSIONS.
// Checking file content: it does NOT import PERMISSIONS.
// So no edit needed for UsersManager.tsx.
import { Trash2, UserPlus, Shield, Check } from 'lucide-react';

type User = {
    id: number;
    name: string | null;
    email: string;
    permissions: string[];
};

export default function UsersManager({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [isCreating, setIsCreating] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleCreate = async (formData: FormData) => {
        const res = await createUser(formData);

        if (res.success) {
            setMessage({ text: res.message, type: 'success' });
            setIsCreating(false);
            // In a real app we might re-fetch, but for now we reload or rely on revalidatePath triggers if parent refreshes
            // To update UI instantly without reload:
            window.location.reload();
        } else {
            setMessage({ text: res.message, type: 'error' });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        const res = await deleteUser(id);
        if (res.success) {
            setUsers(users.filter(u => u.id !== id));
            setMessage({ text: res.message, type: 'success' });
        } else {
            setMessage({ text: res.message, type: 'error' });
        }
    };

    return (
        <section className="glass-card p-8 mt-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield size={24} className="text-emerald-400" />
                Gestión de Usuarios y Accesos
            </h3>

            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                {users.map(user => (
                    <div key={user.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between group">
                        <div>
                            <p className="font-bold text-white">{user.name}</p>
                            <p className="text-sm text-slate-400">Usuario: {user.email}</p>
                            <div className="flex gap-2 mt-2">
                                {user.permissions.includes('ADMIN') ? (
                                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Admin Total</span>
                                ) : (
                                    <>
                                        {user.permissions.map(p => (
                                            <span key={p} className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded max-w-[150px] truncate" title={p}>
                                                {p.replace('MANAGE_', '').replace('_', ' ')}
                                            </span>
                                        ))}
                                        {user.permissions.length === 0 && (
                                            <span className="text-[10px] bg-white/5 text-slate-500 px-2 py-0.5 rounded">Solo Lectura</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Eliminar usuario"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {isCreating ? (
                    <form action={handleCreate} className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-bold text-white mb-4">Nuevo Usuario</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Nombre (Alias)</label>
                                <input name="name" required className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" placeholder="Ej: Francisca" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Usuario de Acceso</label>
                                <input name="email" required className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" placeholder="Ej: francisca" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs text-slate-400 block mb-1">Contraseña</label>
                                <input name="password" type="password" required minLength={6} className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" placeholder="******" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">Permisos de Edición</label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer">
                                    <input type="checkbox" name="perm_projects" className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-sky-500" />
                                    <span className="text-sm text-slate-300">Proyectos</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer">
                                    <input type="checkbox" name="perm_tasks" className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-sky-500" />
                                    <span className="text-sm text-slate-300">Tareas y Movs</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer">
                                    <input type="checkbox" name="perm_employees" className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-sky-500" />
                                    <span className="text-sm text-slate-300">Empleados</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 rounded hover:bg-rose-500/5 cursor-pointer">
                                    <input type="checkbox" name="perm_admin" className="rounded bg-white/10 border-rose-500/50 text-rose-500 focus:ring-rose-500" />
                                    <span className="text-sm text-rose-300 font-bold">Admin Total</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20">Crear Usuario</button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full py-3 border-2 border-dashed border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <UserPlus size={20} />
                        Agregar Usuario
                    </button>
                )}
            </div>
        </section>
    );
}
