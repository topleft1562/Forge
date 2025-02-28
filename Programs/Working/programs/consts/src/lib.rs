use anchor_lang::prelude::*;

pub mod consts;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use crate::instructions::*;
use crate::state::LiquidityPool;

declare_id!("5wAPQCQPif8g6PMAJJUYDxmmRbYzXSFBCHH2NsGGU5xH");

#[program]
pub mod pump {
    use super::*;

    pub fn initialize(ctx: Context<Setup>) -> Result<()> {
        instructions::initialize(ctx)
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_one: u64,
        amount_two: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.set_inner(LiquidityPool::new(
            ctx.accounts.mint_token_one.key(),
            ctx.bumps.pool,
        ));
        instructions::add_liquidity::add_liquidity(ctx, amount_one, amount_two)
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
    ) -> Result<()> {
        instructions::remove_liquidity(ctx)
    }

    pub fn swap(ctx: Context<Swap>, amount: u64, style: u64, minOut: u64) -> Result<()> {
        instructions::swap(ctx, amount, style, minOut)
    }
}