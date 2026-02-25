'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e:  React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      // Check if username is taken
      const { data: existing } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username. toLowerCase())
        .maybeSingle();

      if (existing) {
        toast.error('Username already taken');
        setLoading(false);
        return;
      }

      // Just sign up - the trigger will create the profile automatically! 
      const { data, error } = await supabase. auth.signUp({
        email: formData.email,
        password: formData. password,
        options: {
          data: {
            username: formData.username. toLowerCase()
          }
        }
      });

      if (error) throw error;
      if (! data.user) throw new Error('No user created');

      // Wait a moment for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the username in the profile (in case trigger used email prefix)
      await supabase
        .from('users')
        .update({ username: formData.username.toLowerCase() })
        .eq('id', data.user.id);

      // Fetch the created profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userData) {
        setUser(userData);
      }

      toast.success('Account created!  🎉');
      router.push('/');
      
    } catch (error:  any) {
      console.error('Error:', error);
      
      if (error.message?. includes('User already registered')) {
        toast.error('Email already registered');
      } else {
        toast.error(error.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
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
                value={formData. username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value. toLowerCase().replace(/[^a-z0-9_]/g, '') })}
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
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus: outline-none focus:border-[#5865f2]"
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
              {loading ?  'Creating.. .' : 'Create Account'}
            </button>
          </form>

          <div className="px-6 pb-6 text-center border-t border-gray-800 pt-6">
            <Link href="/login" className="text-[#5865f2] hover: underline">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}