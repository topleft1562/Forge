use crate::{errors::CustomError, state::*};
use anchor_lang::prelude::*;
use anchor_lang::system_program;

pub fn initialize(
    ctx: Context<InitializeCurveConfiguration>,
    fees: f64,
) -> Result<()> {
    let dex_config = &mut ctx.accounts.dex_configuration_account;

    if fees < 0_f64 || fees > 100_f64 {
        return err!(CustomError::InvalidFee);
    }

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.admin.to_account_info(),
                to: ctx.accounts.global_account.to_account_info(),
            },
        ),
        10000000,
    )?;

    dex_config.set_inner(CurveConfiguration::new(
        fees,
        ctx.accounts.admin.key() 
    ));

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeCurveConfiguration<'info> {
    #[account(
        init,
        space = CurveConfiguration::ACCOUNT_SIZE,
        payer = admin,
        seeds = [CurveConfiguration::SEED.as_bytes()],
        bump,
    )]
    pub dex_configuration_account: Box<Account<'info, CurveConfiguration>>,

    /// CHECK
    #[account(
        mut,
        seeds = [b"global"],
        bump,
    )]
    pub global_account: AccountInfo<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}