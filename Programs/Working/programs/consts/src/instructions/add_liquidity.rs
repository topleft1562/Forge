use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use crate::consts::ADMIN;
use crate::state::{LiquidityPool, LiquidityPoolAccount};


#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(
        init,
        space = LiquidityPool::ACCOUNT_SIZE,
        payer = user,
        seeds = [b"liquidity_pool", mint_token_one.key().as_ref()],
        bump
    )]
    pub pool: Box<Account<'info, LiquidityPool>>,

    /// CHECK
    #[account(mut, seeds = [b"global"], bump)]
    pub global_account: AccountInfo<'info>,

    pub mint_token_one: Account<'info, Mint>,

    #[account(
        init,
        payer = user,
        associated_token::mint = mint_token_one,
        associated_token::authority = global_account
    )]
    pub pool_token_account_one: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_token_one,
        associated_token::authority = user,
    )]
    pub user_token_account_one: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user.key().to_string() == ADMIN.to_string(),
    )]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn add_liquidity(ctx: Context<AddLiquidity>, amount_one: u64, amount_two: u64) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    pool.add_liquidity_optimized(
        &ctx.accounts.mint_token_one,
        &ctx.accounts.pool_token_account_one,
        &ctx.accounts.user_token_account_one,
        &ctx.accounts.global_account,
        amount_one,
        amount_two,
        &ctx.accounts.user,
        &ctx.accounts.token_program,
        &ctx.accounts.system_program,
    )
}