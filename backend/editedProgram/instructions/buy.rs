use anchor_lang::prelude::*;

use crate::swap::Swap;

use crate::state::{LiquidityPoolAccount};

pub fn buy(ctx: Context<Swap>, amount: u64) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    let token_one_accounts = (
        &mut *ctx.accounts.token_mint,
        &mut *ctx.accounts.pool_token_account,
        &mut *ctx.accounts.user_token_account,
    );

    pool.buy(
        token_one_accounts,
        &mut ctx.accounts.pool_sol_vault,
        amount,
        &ctx.accounts.user,
        &ctx.accounts.token_program,
        &ctx.accounts.system_program,
    )?;
    Ok(())
}

