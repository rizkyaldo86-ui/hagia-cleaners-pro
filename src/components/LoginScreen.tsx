import React, { useState } from 'react';
import { Lock, LogIn, ChevronRight, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../lib/authStore';

export default function LoginScreen() {
  const { login } = useAuthStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePinClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin.length === 4) {
      const success = login(pin);
      if (!success) {
        setError(true);
        setPin('');
      }
    }
  };

  // Auto-submit when 4 digits are entered
  React.useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-slate-900/40 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lock size={120} />
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
              <LogIn size={32} />
            </div>
            
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Hagia Pro ERP</h1>
            <p className="text-slate-400 font-medium mb-8">Sistem Informasi Eksekutif & Operasional. Masukkan PIN akses Anda.</p>

            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex gap-4 justify-center mb-6">
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={index}
                    className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold transition-all shadow-inner ${
                      pin.length > index 
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
                        : error
                          ? 'border-rose-500/50 bg-rose-500/10'
                          : 'border-slate-700 bg-slate-800/50 text-slate-500'
                    }`}
                  >
                    {pin.length > index ? '*' : ''}
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {error && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="text-rose-400 text-sm font-bold text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20 mb-4"
                   >
                     PIN tidak valid atau peran telah dihapus.
                   </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinClick(num.toString())}
                  className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 text-white font-bold text-xl py-4 rounded-2xl transition-colors shadow-sm"
                >
                  {num}
                </button>
              ))}
              <div className="bg-transparent"></div>
              <button
                onClick={() => handlePinClick('0')}
                className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 text-white font-bold text-xl py-4 rounded-2xl transition-colors shadow-sm"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="bg-slate-800/50 hover:bg-rose-900/50 hover:text-rose-400 border border-slate-700/50 text-slate-400 font-bold text-sm py-4 rounded-2xl transition-colors shadow-sm uppercase tracking-wider"
              >
                Hapus
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <Hash size={14} />
              <span>Akses dibatasi sesuai Role / Jabatan</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
