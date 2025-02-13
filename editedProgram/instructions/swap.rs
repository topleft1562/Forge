use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::state::{CurveConfiguration, LiquidityPool};
#[derive(Accounts)]
pub struct Swap<'info> {
    // The dex configuration account from the frontend
    #[account(
        mut,
        seeds = [CurveConfiguration::SEED.as_bytes()],
        bump,
    )]
    pub dex_configuration_account: Option<Box<Account<'info, CurveConfiguration>>>,

    // The liquidity pool, but using the second struct's logic
    #[account(
        mut,
        seeds = [LiquidityPool::POOL_SEED_PREFIX.as_bytes(), token_mint.key().as_ref()],
        bump = pool.bump
    )]
    pub pool: Box<Account<'info, LiquidityPool>>,

    // The token mint involved in the swap
    #[account(mut)]
    pub token_mint: Box<Account<'info, Mint>>,

    // The pool token account for the token mint, owned by the pool
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = pool
    )]
    pub pool_token_account: Box<Account<'info, TokenAccount>>,

    // The pool's Solana vault for handling SOL
    #[account(
        mut,
        seeds = [LiquidityPool::SOL_VAULT_PREFIX.as_bytes(), token_mint.key().as_ref()],
        bump
    )]
    pub pool_sol_vault: AccountInfo<'info>,

    // The user's token account for the token involved in the swap
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,

    // The signer (user performing the transaction)
    #[account(mut)]
    pub user: Signer<'info>,

    // Rent system program (Solana system program for rent)
    pub rent: Sysvar<'info, Rent>,

    // Solana system program for handling system-level instructions
    pub system_program: Program<'info, System>,

    // The token program, used for token transfers and minting
    pub token_program: Program<'info, Token>,

    // Associated token program for handling associated token accounts
    pub associated_token_program: Program<'info, AssociatedToken>,
}