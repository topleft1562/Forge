use crate::{errors::CustomError, state::*};
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::consts::ADMIN;


pub fn initialize(
    ctx: Context<Setup>,
) -> Result<()> {

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

    Ok(())
}

#[derive(Accounts)]
pub struct Setup<'info> {
    /// CHECK
    #[account(
        mut,
        seeds = [b"global"],
        bump,
    )]
    pub global_account: AccountInfo<'info>,

    #[account(
        mut,
        constraint = admin.key().to_string() == ADMIN.to_string(),
    )]
    pub admin: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}