import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

const connection = new Connection(
  process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

export async function getTreasuryBalance(
  treasuryWallet: string,
  tokenMint: string
): Promise<number> {
  try {
    const treasuryPubkey = new PublicKey(treasuryWallet);
    const mintPubkey = new PublicKey(tokenMint);

    const tokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      treasuryPubkey
    );

    const accountInfo = await getAccount(connection, tokenAccount);
    
    // Assuming 9 decimals for the token (adjust if different)
    return Number(accountInfo.amount) / 1_000_000_000;
  } catch (error) {
    console.error('Error fetching treasury balance:', error);
    return 0;
  }
}

export async function getSOLBalance(walletAddress: string): Promise<number> {
  try {
    const pubkey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return 0;
  }
}

export { connection };