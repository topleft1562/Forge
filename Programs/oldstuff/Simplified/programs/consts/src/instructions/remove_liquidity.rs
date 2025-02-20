use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use crate::consts::ADMIN;
use crate::state::{LiquidityPool, LiquidityPoolAccount};

pub fn remove_liquidity(
    ctx: Context<RemoveLiquidity>,
) -> Result<()> {
    // Call the remove_liquidity in state once we get it sorted out.
    Ok(())
}

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(
        mut,
        seeds = [LiquidityPool::POOL_SEED_PREFIX.as_bytes(), mint_token_one.key().as_ref()],
        bump = pool.bump
    )]
    pub pool: Box<Account<'info, LiquidityPool>>,
    
    /// CHECK: Safe - Global account PDA
    #[account(
        mut,
        seeds = [b"global"],
        bump,
    )]
    pub global_account: AccountInfo<'info>,

    #[account(mut)]
    pub mint_token_one: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = mint_token_one,
        associated_token::authority = global_account
    )]
    pub pool_token_account_one: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_token_one,
        associated_token::authority = user,
    )]
    pub user_token_account_one: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = user.key().to_string() == ADMIN.to_string(),
    )]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}