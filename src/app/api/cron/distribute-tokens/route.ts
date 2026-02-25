// src/app/api/cron/distribute/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction, 
  createAssociatedTokenAccountInstruction,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import bs58 from 'bs58'

const CRON_SECRET = process.env.CRON_SECRET
export const dynamic = 'force-dynamic' // ✅ Prevent static generation

// Payout amounts per level
const PAYOUT_PER_LEVEL:  { [key: number]: number } = {
  1: 10000,
  2: 15000,
  3: 20000,
  4: 25000,
  5: 30000,
  10: 50000,
  25: 100000,
  50: 200000,
  100: 500000
}

function getPayoutAmount(level: number): number {
  const levels = Object.keys(PAYOUT_PER_LEVEL).map(Number).sort((a, b) => b - a)
  for (const tierLevel of levels) {
    if (level >= tierLevel) {
      return PAYOUT_PER_LEVEL[tierLevel]
    }
  }
  return 10000
}

export async function GET(request: NextRequest) {
  try {
    // ⚠️ SECURITY: Verify authorization
    const authHeader = request.headers.get('authorization')
    const querySecret = request.nextUrl.searchParams.get('secret')
    
    // Allow either Bearer token OR ? secret=xxx query param (for easier testing)
    const isAuthorized = 
      authHeader === `Bearer ${CRON_SECRET}` || 
      querySecret === CRON_SECRET

    if (! isAuthorized) {
      console.log('❌ Unauthorized access attempt')
      return NextResponse. json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Checking environment variables...')

    // Check required env vars
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL
    const TREASURY_PRIVATE_KEY = process.env. TREASURY_PRIVATE_KEY
    const TOKEN_ADDRESS = process.env. NEXT_PUBLIC_CONTRACT_ADDRESS

    if (!SOLANA_RPC_URL || !TREASURY_PRIVATE_KEY || !TOKEN_ADDRESS) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        details: {
          hasRPC: !!SOLANA_RPC_URL,
          hasPrivateKey: !!TREASURY_PRIVATE_KEY,
          hasTokenAddress: !!TOKEN_ADDRESS
        }
      }, { status: 500 })
    }

    console.log('🚀 Starting token distribution.. .')

    // Get all users with wallet addresses from Supabase
    const { data: users, error:  usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .not('wallet_address', 'is', null)
      .neq('wallet_address', '')

    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError. message)
      return NextResponse. json({ 
        error: 'Failed to fetch users from database',
        details: usersError.message
      }, { status: 500 })
    }

    console.log(`📋 Found ${users?. length || 0} users with wallet addresses`)

    if (! users || users.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No users with wallet addresses',
        distributed: 0
      })
    }

    // Setup Solana connection
    let connection: Connection
    let treasuryKeypair: Keypair
    let tokenMint: PublicKey

    try {
      connection = new Connection(SOLANA_RPC_URL, 'confirmed')
      treasuryKeypair = Keypair. fromSecretKey(bs58.decode(TREASURY_PRIVATE_KEY))
      tokenMint = new PublicKey(TOKEN_ADDRESS)
      console.log('✅ Solana connection established')
      console.log('💼 Treasury wallet:', treasuryKeypair.publicKey.toBase58())
      console.log('🪙 Token mint:', tokenMint.toBase58())
    } catch (solanaError:  any) {
      console.error('❌ Solana setup failed:', solanaError.message)
      return NextResponse.json({ 
        error: 'Failed to setup Solana connection',
        details: solanaError.message
      }, { status: 500 })
    }

    let successCount = 0
    let failCount = 0
    let totalDistributed = 0
    const results: any[] = []

    // Process each user
    for (const user of users) {
      try {
        // Assume level 1 if not in schema (you can add level column to users table)
        const userLevel = 1 // TODO: Add level column to users table if needed
        const payoutAmount = getPayoutAmount(userLevel)
        
        // Validate wallet address
        let userWallet: PublicKey
        try {
          userWallet = new PublicKey(user.wallet_address!)
        } catch (e) {
          console.error(`❌ Invalid wallet address for ${user.username}:  ${user.wallet_address}`)
          results.push({ user: user.username, status: 'failed', reason: 'Invalid wallet address' })
          
          // Record failed transaction
          await supabaseAdmin.from('transactions').insert({
            user_id: user.id,
            amount: payoutAmount,
            type: 'reward',
            status: 'failed',
            signature: null,
            description: 'Invalid wallet address'
          })
          
          failCount++
          continue
        }

        console.log(`💸 Processing ${user.username} - ${payoutAmount} tokens`)

        // Get treasury token account (Token-2022)
        const treasuryTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          treasuryKeypair.publicKey,
          false,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )

        // Get user token account (Token-2022)
        const userTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          userWallet,
          false,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )

        // Check if user token account exists
        const accountInfo = await connection. getAccountInfo(userTokenAccount)
        
        const transaction = new Transaction()

        // Create associated token account if it doesn't exist
        if (!accountInfo) {
          console.log(`  📝 Creating Token-2022 account for ${user.username}`)
          transaction.add(
            createAssociatedTokenAccountInstruction(
              treasuryKeypair. publicKey,
              userTokenAccount,
              userWallet,
              tokenMint,
              TOKEN_2022_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          )
        }

        // Get token decimals
        const mintInfo = await connection.getAccountInfo(tokenMint)
        let decimals = 9
        
        if (mintInfo && mintInfo.data.length >= 44) {
          decimals = mintInfo.data[44]
        }

        // Add transfer instruction
        const amountWithDecimals = BigInt(payoutAmount) * BigInt(Math.pow(10, decimals))
        
        transaction.add(
          createTransferInstruction(
            treasuryTokenAccount,
            userTokenAccount,
            treasuryKeypair.publicKey,
            amountWithDecimals,
            [],
            TOKEN_2022_PROGRAM_ID
          )
        )

        // Send transaction
        const signature = await connection. sendTransaction(transaction, [treasuryKeypair], {
          skipPreflight: false,
          preflightCommitment:  'confirmed'
        })

        await connection.confirmTransaction(signature, 'confirmed')

        console.log(`✅ Sent ${payoutAmount} tokens to ${user.username}. TX: ${signature}`)

        // Record successful transaction
        await supabaseAdmin.from('transactions').insert({
          user_id:  user.id,
          amount: payoutAmount,
          type:  'reward',
          status:  'completed',
          signature: signature,
          description: `Level ${userLevel} reward distribution`
        })

        // Update user total_rewards
        await supabaseAdmin
          .from('users')
          .update({ total_rewards: user.total_rewards + payoutAmount })
          .eq('id', user.id)

        results.push({ 
          user: user.username, 
          status: 'success', 
          amount: payoutAmount,
          tx:  signature
        })

        successCount++
        totalDistributed += payoutAmount

      } catch (error: any) {
        console.error(`❌ Failed to send to ${user.username}: `, error.message)
        
        try {
          const userLevel = 1
          await supabaseAdmin.from('transactions').insert({
            user_id: user.id,
            amount: getPayoutAmount(userLevel),
            type: 'reward',
            status: 'failed',
            signature: null,
            description: error.message
          })
        } catch (dbError) {
          console.error('Failed to record failed transaction:', dbError)
        }

        results.push({ 
          user: user.username, 
          status: 'failed', 
          reason: error.message 
        })

        failCount++
      }
    }

    console.log(`\n✅ Distribution complete! `)
    console.log(`   Success: ${successCount}`)
    console.log(`   Failed: ${failCount}`)
    console.log(`   Total Distributed: ${totalDistributed} tokens\n`)

    return NextResponse.json({
      success: true,
      successCount,
      failCount,
      totalDistributed,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Distribution error:', error)
    return NextResponse.json({ 
      success: false, 
      error:  error.message,
      stack: error.stack
    }, { status: 500 })
  }
}