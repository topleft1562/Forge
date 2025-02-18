use anchor_lang::prelude::*;

pub mod consts;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use crate::instructions::*;
use crate::state::LiquidityPool;

declare_id!("Dq4ZEEryMaK9LmC5GfarmYWhkvtp6Ff1hLGCzCnsnkfo");

#[program]
pub mod pump {
    use super::*;

    pub fn initialize(ctx: Context<InitializeCurveConfiguration>, fee: f64) -> Result<()> {
        instructions::initialize(ctx, fee)
    }

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        msg!("Initialize pool instruction called");
        msg!("Pool address: {}", ctx.accounts.pool.key());
        msg!("Mint address: {}", ctx.accounts.mint_token_one.key());
        
        let pool = &mut ctx.accounts.pool;
        pool.set_inner(LiquidityPool::new(
            ctx.accounts.mint_token_one.key(),
            ctx.bumps.pool,
        ));
        Ok(())
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_one: u64,
        amount_two: u64,
    ) -> Result<()> {
        instructions::add_liquidity::add_liquidity(ctx, amount_one, amount_two)
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        nonce: u8,
        init_pc_amount: u64,
    ) -> Result<()> {
        instructions::remove_liquidity(ctx, nonce, init_pc_amount)
    }

    pub fn swap(ctx: Context<Swap>, amount: u64, style: u64) -> Result<()> {
        instructions::swap(ctx, amount, style)
    }
}