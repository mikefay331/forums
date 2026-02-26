'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Establish client session — AuthProvider will handle setting the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      toast.success('Account created! 🎉');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-[#5865f2] px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-400">
                USERNAME
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2]"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                placeholder="username"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lowercase, numbers, underscores only
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-400">
                EMAIL
              </label>
              <input
                type="email"
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-400">
                PASSWORD
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2]"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-400">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2]"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                placeholder="Confirm password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-gray-600 text-white px-6 py-3 rounded font-semibold transition"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="px-6 pb-6 text-center border-t border-gray-800 pt-6">
            <Link href="/login" className="text-[#5865f2] hover:underline">
              Already have an account? Login
            </Link>
          </div>
      </div>
    </div>
  );
}