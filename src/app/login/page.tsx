'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Fetch user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        // If user doesn't exist in users table, create profile (fallback)
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authData.user?.id,
            email: formData.email,
            username: formData.email.split('@')[0], // Default username from email
            experience: 0,
            posts: 0,
            level: 1,
            total_rewards: 0,
            role: 'user',
            is_verified: false,
          })
          .select()
          .single();

        if (createError) throw createError;
        setUser(newUser);
      } else {
        setUser(userData);
      }

      toast.success('Logged in successfully!');
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#5865f2] px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Login</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-400">
                EMAIL
              </label>
              <input
                type="email"
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
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
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-semibold transition mt-6"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-6 text-center border-t border-gray-800 pt-6">
            <p className="text-gray-400">
              Don't have an account? {' '}
              <Link href="/register" className="text-[#5865f2] hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm text-center">
            🚀 Join the $FORUMS community and start posting!
          </p>
        </div>
      </div>
    </div>
  );
}