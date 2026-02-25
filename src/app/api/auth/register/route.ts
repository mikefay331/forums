import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Create admin client inline to ensure env vars are loaded
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    const { email, password, username, wallet_address } = body;

    console.log('📝 Registration attempt:', { email, username });
    console.log('🔑 Has service key:', !!supabaseServiceKey);

    // Validate
    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check username
    const { data: existing } = await supabase
      .from('users')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: { username: username.toLowerCase() }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData?.user) {
      return NextResponse.json({ error: 'No user created' }, { status: 500 });
    }

    console.log('✅ Auth user:', authData.user.id);

    // Create profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        wallet_address: wallet_address?.trim() || null,
        level: 1,
        experience: 0,
        posts: 0,
        total_rewards: 0,
        role: 'user',
        is_verified: false,
        bio: null,
        avatar: null,
      })
      .select()
      .single();

    if (userError) {
      console.error('Profile error:', userError);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    console.log('✅ Profile created');

    return NextResponse.json({ success: true, user: userData });

  } catch (error: any) {
    console.error('💥 Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}