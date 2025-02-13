use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::state::{LiquidityPool, LiquidityPoolAccount, LiquidityProvider};

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        space = LiquidityPool::ACCOUNT_SIZE,
        payer = user,
        seeds = [b"liquidity_pool", mint_token_one.key().as_ref()],
        bump
    )]
    pub pool: Box<Account<'info, LiquidityPool>>,

    pub mint_token_one: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub pool: Box<Account<'info, LiquidityPool>>,

    /// CHECK
    #[account(mut, seeds = [b"global"], bump)]
    pub global_account: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = LiquidityProvider::ACCOUNT_SIZE,
        seeds = [b"LiqudityProvider", pool.key().as_ref(), user.key().as_ref()],
        bump,
    )]
    pub liquidity_provider_account: Account<'info, LiquidityProvider>,

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

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

// Uncomment if you need the explicit initializePool function in Rust:
// pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
//     let pool = &mut ctx.accounts.pool;
//     pool.set_inner(LiquidityPool::new(
//         ctx.accounts.mint_token_one.key(),
//         ctx.bumps.pool,
//     ));
//     Ok(())
// }

pub fn add_liquidity(ctx: Context<AddLiquidity>, amount_one: u64, amount_two: u64) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    //
    // 1) Transfer the SPL tokens from user -> pool token account
    //
//    pool.transfer_token_to_pool(
//        &ctx.accounts.user_token_account_one,
//        &ctx.accounts.pool_token_account_one,
//        amount_one,
//        &ctx.accounts.user,
//        &ctx.accounts.token_program,
//    )?;

    //
    // 2) Transfer SOL from user -> global_account
    //
//    pool.transfer_sol_to_pool(
//        &ctx.accounts.user,
//        &ctx.accounts.global_account,
//        amount_two,
//        &ctx.accounts.system_program,
//    )?;

    //
    // 3) Update on-chain pool data (reserves, total_supply, etc.) via your “optimized” method
    //
    pool.add_liquidity_optimized(
        &ctx.accounts.mint_token_one,
        &ctx.accounts.pool_token_account_one,
        &ctx.accounts.user_token_account_one,
        &ctx.accounts.global_account,
        amount_one,
        amount_two,
        &mut ctx.accounts.liquidity_provider_account,
        &ctx.accounts.user,
        &ctx.accounts.token_program,
        &ctx.accounts.system_program,
    )
}