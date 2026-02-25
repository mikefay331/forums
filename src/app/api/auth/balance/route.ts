// src/app/api/treasury/balance/route.ts
import { NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'

export const dynamic = 'force-dynamic' // ✅ Prevent static generation

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

export async function GET() {
  try {
    if (! TREASURY_WALLET || !TOKEN_ADDRESS) {
      return NextResponse.json({ 
        success: false,
        balance: 0,
        error: 'Missing environment variables'
      }, { status:  500 })
    }

    const connection = new Connection(SOLANA_RPC_URL)
    const treasuryPubkey = new PublicKey(TREASURY_WALLET)
    const tokenMint = new PublicKey(TOKEN_ADDRESS)

    const treasuryTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      treasuryPubkey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const tokenAccountInfo = await connection.getTokenAccountBalance(treasuryTokenAccount)
    const balance = tokenAccountInfo. value.uiAmount || 0

    console.log('Treasury balance:', balance)

    return NextResponse.json({ 
      success: true,
      balance:  Math.floor(balance)
    })
  } catch (error:  any) {
    console.error('Error fetching treasury balance:', error)
    return NextResponse.json({ 
      success: false,
      balance: 0,
      error:  error.message 
    }, { status: 500 })
  }
}