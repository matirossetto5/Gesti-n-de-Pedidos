import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-[#003366]/10 shadow-lg w-96">
        <h2 className="text-2xl font-serif italic text-[#003366] mb-6">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[#003366]/20 rounded-xl p-3 mb-4 font-mono text-sm"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[#003366]/20 rounded-xl p-3 mb-6 font-mono text-sm"
          required
        />
        <button type="submit" className="w-full bg-[#003366] text-white rounded-xl py-3 font-bold shadow-lg hover:bg-[#003366]/90 transition-all mb-4">
          {isLogin ? 'Ingresar' : 'Registrarse'}
        </button>
        <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-[#003366]/60 text-xs hover:underline">
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </form>
    </div>
  );
};
