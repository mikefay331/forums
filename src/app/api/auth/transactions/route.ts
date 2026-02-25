// src/app/api/treasury/transactions/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic' // ✅ Prevent static generation

export async function GET() {
  try {
    console.log('📋 Fetching transactions...')
    
    // Fetch transactions with user data (using a join)
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user: users (
          id,
          username,
          email,
          wallet_address,
          avatar
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({
        success: false,
        transactions: [],
        totalDistributed: 0,
        error:  error.message
      }, { status: 500 })
    }

    console.log(`Found ${transactions?. length || 0} transactions`)

    // Calculate total distributed (only completed transactions)
    const totalDistributed = transactions
      ?.filter((tx) => tx.status === 'completed')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      totalDistributed: Math.floor(totalDistributed)
    })
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return NextResponse. json({
      success: false,
      transactions: [],
      totalDistributed: 0,
      error: error.message
    }, { status: 500 })
  }
}