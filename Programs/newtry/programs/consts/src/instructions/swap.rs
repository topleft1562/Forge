use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use crate::consts::ADMIN;
use crate::state::{LiquidityPool, LiquidityPoolAccount};

pub fn swap(ctx: Context<Swap>, amount: u64, style: u64, minOut: u64) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    let token_one_accounts = (
        &mut *ctx.accounts.mint_token_one.clone(),
        &mut *ctx.accounts.pool_token_account_one,
        &mut *ctx.accounts.user_token_account_one,
    );

    let token_two_accounts = (
        &mut *ctx.accounts.mint_token_one.clone(),
        &mut ctx.accounts.global_account.to_account_info().clone(),
        &mut ctx.accounts.user.clone()
    );

    pool.swap(
        &ctx.accounts.fee_recipient,
        &ctx.accounts.creator_account,
        token_one_accounts,
        token_two_accounts,
        amount,
        minOut,
        style,
        ctx.bumps.global_account,
        &ctx.accounts.user,
        &ctx.accounts.token_program,
        &ctx.accounts.system_program,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct Swap<'info> {
    
    #[account(
        mut,
        seeds = [LiquidityPool::POOL_SEED_PREFIX.as_bytes(), mint_token_one.key().as_ref()],
        bump = pool.bump
    )]
    pub pool: Box<Account<'info, LiquidityPool>>,

    /// CHECK: This is the fee recipient account
    #[account(
        mut,
        constraint = fee_recipient.key().to_string() == ADMIN.to_string(),
    )]
    pub fee_recipient: AccountInfo<'info>,

    /// CHECK: this is the cretor fee recipient account
    #[account(
        mut,
        constraint = creator_account.key() == pool.creator,
    )]
    pub creator_account: AccountInfo<'info>,

    /// CHECK
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

    #[account(mut)]
    pub user: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}