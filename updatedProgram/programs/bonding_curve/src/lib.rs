#[program]
pub mod bonding_curve {
    use super::*;

    pub fn initialize(ctx: Context<InitializeCurveConfiguration>, fee: f64) -> Result<()> {
        instructions::initialize(ctx, fee)
    }

    pub fn create_pool(ctx: Context<CreateLiquidityPool>) -> Result<()> {
        instructions::create_pool(ctx)
    }

    pub fn add_liquidity(ctx: Context<AddLiquidity>) -> Result<()> {
        instructions::add_liquidity(ctx)
    }

    pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, bump: u8) -> Result<()> {
        instructions::remove_liquidity(ctx, bump)
    }

    pub fn buy(ctx: Context<Buy>, amount: u64) -> Result<()> {
        instructions::buy(ctx, amount)
    }

    pub fn sell(ctx: Context<Sell>, amount: u64, bump: u8) -> Result<()> {
        instructions::sell(ctx, amount, bump)
    }

    // ✅ Corrected swap function
    pub fn swap(ctx: Context<Swap>, amount: u64, style: u64) -> Result<()> {
        match style {
            0 => {
                instructions::buy(
                    Context::new(ctx.program_id, &mut ctx.accounts), 
                    amount
                )
            }
            1 => {
                let bump = *ctx.bumps.get("pool").ok_or(ErrorCode::MissingBump)?;
                instructions::sell(
                    Context::new(ctx.program_id, &mut ctx.accounts), 
                    amount, 
                    bump
                )
            }
            _ => Err(ErrorCode::InvalidSwapStyle.into()),
        }
    }
}
