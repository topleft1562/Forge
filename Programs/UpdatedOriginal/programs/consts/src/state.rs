use crate::consts::TOKENSCALE;
use crate::consts::SOLSCALE;
use crate::errors::CustomError;
use crate::utils::convert_from_float;
use crate::utils::convert_to_float;
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use std::cmp;
use std::ops::{Add, Div, Mul, Sub};

#[account]
pub struct CurveConfiguration {
    pub fees: f64,
    pub fee_recipient: Pubkey,
}

impl CurveConfiguration {
    pub const SEED: &'static str = "CurveConfiguration";
    // Update size: Discriminator (8) + f64 (8) + Pubkey (32) = 48 bytes
    pub const ACCOUNT_SIZE: usize = 8 + 8 + 32;

    pub fn new(fees: f64, fee_recipient: Pubkey) -> Self {
        Self { 
            fees,
            fee_recipient 
        }
    }
}

#[account]
pub struct LiquidityProvider {
    pub shares: u64, // The number of shares this provider holds in the liquidity pool
}

impl LiquidityProvider {
    pub const SEED_PREFIX: &'static str = "LiqudityProvider"; 
    
    // Discriminator (8) + shares (8) = 16 bytes
    pub const ACCOUNT_SIZE: usize = 8 + 8;
}

#[account]
pub struct LiquidityPool {
    pub token_one: Pubkey, // 32 bytes
    pub token_two: Pubkey, // 32 bytes
    pub total_supply: u64, // 8 bytes
    pub reserve_one: u64,  // 8 bytes
    pub reserve_two: u64,  // 8 bytes
    pub bump: u8,          // 1 byte
    pub padding: [u8; 7],  // 7 bytes to make total size 96 bytes
}

impl LiquidityPool {
    pub const POOL_SEED_PREFIX: &'static str = "liquidity_pool";

    // Updated ACCOUNT_SIZE: 8 (discriminator) + 32 + 32 + 8 + 8 + 8 + 1 + 7 = 96 bytes
    pub const ACCOUNT_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 7;

    // Constructor to initialize a LiquidityPool with two tokens and a bump for the PDA
    pub fn new(token_one: Pubkey, bump: u8) -> Self {
        Self {
            token_one,
            token_two: Pubkey::default(), // Correctly represents SOL
            total_supply: 0_u64,
            reserve_one: 0_u64,
            reserve_two: 0_u64,
            bump,
            padding: [0; 7], // Initialize padding
        }
    }
}

pub trait LiquidityPoolAccount<'info> {
    // Grants a specific number of shares to a liquidity provider's account
    fn grant_shares(
        &mut self,
        liquidity_provider_account: &mut Account<'info, LiquidityProvider>,
        shares: u64,
    ) -> Result<()>;

    // Removes a specific number of shares from a liquidity provider's account
    fn remove_shares(
        &mut self,
        liquidity_provider_account: &mut Account<'info, LiquidityProvider>,
        shares: u64,
    ) -> Result<()>;

    // Updates the token reserves in the liquidity pool
    fn update_reserves(&mut self, reserve_one: u64, reserve_two: u64) -> Result<()>;

    // Allows adding liquidity by depositing an amount of two tokens and getting back pool shares
    fn add_liquidity(
        &mut self,
        token_one_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        token_two_accounts: (
            &mut Account<'info, Mint>,
            &mut AccountInfo<'info>,
            &mut AccountInfo<'info>,
        ),
        amount_one: u64,
        amount_two: u64,
        liquidity_provider_account: &mut Account<'info, LiquidityProvider>,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
    ) -> Result<()>;

    // Allows removing liquidity by burning pool shares and receiving back a proportionate amount of tokens
    fn remove_liquidity(
        &mut self,
        token_one_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        token_two_accounts: (
            &mut Account<'info, Mint>,
            &mut AccountInfo<'info>,
            &mut AccountInfo<'info>,
        ),
        shares: u64,
        liquidity_provider_account: &mut Account<'info, LiquidityProvider>,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
    ) -> Result<()>;

    // Swap function
    fn swap(
        &mut self,
        bonding_configuration_account: &Account<'info, CurveConfiguration>,
        fee_recipient: &AccountInfo<'info>,  // Admin
        token_one_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        token_two_accounts: (
            &mut Account<'info, Mint>,
            &mut AccountInfo<'info>,
            &mut Signer<'info>,
        ),
        amount: u64,
        style: u64,
        bump: u8,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
    ) -> Result<()>;

    // Transfer functions
    fn transfer_token_from_pool(
        &self,
        from: &Account<'info, TokenAccount>,
        to: &Account<'info, TokenAccount>,
        amount: u64,
        token_program: &Program<'info, Token>,
        authority: &AccountInfo<'info>,
        bump: u8
    ) -> Result<()>;

    fn transfer_token_to_pool(
        &self,
        from: &Account<'info, TokenAccount>,
        to: &Account<'info, TokenAccount>,
        amount: u64,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
    ) -> Result<()>;

    fn transfer_sol_to_pool(
        &self,
        from: &Signer<'info>,
        to: &AccountInfo<'info>,
        amount: u64,
        system_program: &Program<'info, System>,
    ) -> Result<()>;

    fn transfer_sol_from_pool(
        &self,
        from: &AccountInfo<'info>,
        to: &AccountInfo<'info>,
        amount: u64,
        system_program: &Program<'info, System>,
        bump: u8
    ) -> Result<()>;

    // Optimized add liquidity function with system_program parameter
    fn add_liquidity_optimized(
        &mut self,
        mint_token_one: &Account<'info, Mint>,
        pool_token_one: &Account<'info, TokenAccount>,
        user_token_one: &Account<'info, TokenAccount>,
        global_account: &AccountInfo<'info>,
        amount_one: u64,
        amount_two: u64,
        liquidity_provider_account: &mut Account<'info, LiquidityProvider>,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>, // Added parameter
    ) -> Result<()>;
}

impl<'info> LiquidityPoolAccount<'info> for Account<'info, LiquidityPool> {
    fn grant_shares(
        &mut self,
        liquidity_provider_account: &mut Account<'info, LiquidityProvider>,
        shares: u64,
    ) -> Result<()> {
        liquidity_provider_account.shares = liquidity_provider_account
            .shares
            .checked_add(shares)
            .ok_or(CustomError::FailedToAllocateShares)?;

        self.total_supply = self
            .total_supply
            .checked_add(shares)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

        Ok(())
    }

    fn remove_shares(
        &mut self,
        liquidity_provider_account: &mut Account<'info, LiquidityProvider>,
        shares: u64,
    ) -> Result<()> {
        liquidity_provider_account.shares = liquidity_provider_account
            .shares
            .checked_sub(shares)
            .ok_or(CustomError::FailedToDeallocateShares)?;

        self.total_supply = self
            .total_supply
            .checked_sub(shares)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

        Ok(())
    }

    fn update_reserves(&mut self, reserve_one: u64, reserve_two: u64) -> Result<()> {
        self.reserve_one = reserve_one;
        self.reserve_two = reserve_two;

        Ok(())
    }

    fn add_liquidity(
        &mut self,
        token_one_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        token_two_accounts: (
            &mut Account<'info, Mint>,
            &mut AccountInfo<'info>,
            &mut AccountInfo<'info>,
        ),
        amount_one: u64,
        amount_two: u64,
        liquidity_provider_account: &mut Account<'info, LiquidityProvider>,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>, 
    ) -> Result<()> {
        self.add_liquidity_optimized(
            token_one_accounts.0,
            token_one_accounts.1,
            token_one_accounts.2,
            token_two_accounts.1,
            amount_one,
            amount_two,
            liquidity_provider_account,
            authority,
            token_program,
            system_program
        )
    }

    fn remove_liquidity(
        &mut self,
        token_one_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        token_two_accounts: (
            &mut Account<'info, Mint>,
            &mut AccountInfo<'info>,
            &mut AccountInfo<'info>,
        ),
        shares: u64,
        liquidity_provider_account: &mut Account<'info, LiquidityProvider>,
        _authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
    ) -> Result<()> {
        if shares <= 0 {
            return err!(CustomError::FailedToRemoveLiquidity);
        }

        if liquidity_provider_account.shares < shares {
            return err!(CustomError::InsufficientShares);
        }

        let mul_value = shares
            .checked_mul(self.reserve_one)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

        let amount_out_one = mul_value
            .checked_div(self.total_supply)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

        let mul_value = shares
            .checked_mul(self.reserve_two)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

        let amount_out_two = mul_value
            .checked_div(self.total_supply)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

        if amount_out_one <= 0 || amount_out_two <= 0 {
            return err!(CustomError::FailedToRemoveLiquidity);
        }

        self.remove_shares(liquidity_provider_account, shares)?;

        let new_reserves_one = self
            .reserve_one
            .checked_sub(amount_out_one)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
        let new_reserves_two = self
            .reserve_two
            .checked_sub(amount_out_two)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

        self.update_reserves(new_reserves_one, new_reserves_two)?;

        // Optionally, transfer tokens back to the user
        // self.transfer_token_from_pool(
        //     token_one_accounts.1,
        //     token_one_accounts.2,
        //     amount_out_one,
        //     token_program,
        // )?;

        Ok(())
    }

    fn swap(
        &mut self,
        bonding_configuration_account: &Account<'info, CurveConfiguration>,
        fee_recipient: &AccountInfo<'info>,
        token_one_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        token_two_accounts: (
            &mut Account<'info, Mint>,
            &mut AccountInfo<'info>,
            &mut Signer<'info>,
        ),
        amount: u64,
        style: u64,
        bump: u8,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        if amount <= 0 {
            return err!(CustomError::InvalidAmount);
        }
// Assume these come from your contract state AFTER the buy update:
let raw_token_reserve: f64 = self.reserve_one as f64; // updated token reserve in raw units
let raw_sol_reserve: f64   = self.reserve_two as f64;   // updated SOL reserve in raw units

// Convert raw reserves to human-readable (virtual) values.
let token_reserve = raw_token_reserve / TOKENSCALE;
let sol_reserve   = raw_sol_reserve / SOLSCALE;

    
        if style == 0 {  // SOL to Token swap
             
// A user deposits a certain amount of SOL (in raw units).
let deposit_raw: f64 = amount as f64;      // deposit in SOL base units (raw)
let deposit = deposit_raw / SOLSCALE;
// Constant product invariant.
let k = token_reserve * sol_reserve;

// New SOL reserve after deposit.
let new_sol_reserve = sol_reserve + deposit;

// New token reserve computed from the invariant.
let new_token_reserve = k / new_sol_reserve;

// Tokens out (virtual) = decrease in token reserve.
let tokens_bought_virtual = token_reserve - new_token_reserve;

// Convert tokens back to raw units.
let tokens_out = (tokens_bought_virtual * TOKENSCALE).round() as u64;

            // Calculate SOL fees
            let fee_amount = (amount as f64 * 0.001) as u64;
            let amount_after_fee = amount.checked_sub(fee_amount)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
    
            // Update reserves
            self.reserve_two = self.reserve_two
                .checked_add(amount_after_fee)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
            
            self.reserve_one = self.reserve_one
                .checked_sub(tokens_out)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
    
            // Transfer SOL from user to pool
            self.transfer_sol_to_pool(
                token_two_accounts.2,
                token_two_accounts.1,
                amount,
                system_program,
            )?;
    
            // Transfer tokens from pool to user
            self.transfer_token_from_pool(
                token_one_accounts.1,
                token_one_accounts.2,
                tokens_out,
                token_program,
                token_two_accounts.1,
                bump
            )?;
    
            // Transfer SOL fees
            if fee_amount > 0 {
                system_program::transfer(
                    CpiContext::new_with_signer(
                        system_program.to_account_info(),
                        system_program::Transfer {
                            from: token_two_accounts.1.to_account_info(),
                            to: fee_recipient.to_account_info(),
                        },
                        &[&[
                            b"global",
                            &[bump],
                        ]],
                    ),
                    fee_amount,
                )?;
            }
        } else {  // Token to SOL swap
// Assume the user wants to sell tokens they previously bought.
// For example, selling all tokens bought in the buy operation:
let tokens_to_sell_raw: f64 = amount as f64; // tokens in raw units from the buy operation
let tokens_to_sell = tokens_to_sell_raw / TOKENSCALE; // convert to human-readable tokens

// The invariant remains the same (k):
let k = token_reserve * sol_reserve;

// When selling, the token reserve increases.
let new_token_reserve_after_sell = token_reserve + tokens_to_sell;

// New SOL reserve determined by the invariant.
let new_sol_reserve_after_sell = k / new_token_reserve_after_sell;

// SOL returned (virtual) = decrease in SOL reserve.
let sol_returned_virtual = sol_reserve - new_sol_reserve_after_sell;

// Convert SOL returned back to raw units.
let amount_out = (sol_returned_virtual * SOLSCALE).round() as u64;
        
            // Calculate SOL fees
            let fee_amount = (amount_out as f64 * 0.001) as u64;
            let sol_out_after_fee = amount_out.checked_sub(fee_amount)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
    
            // Update reserves
            self.reserve_one = self.reserve_one
                .checked_add(amount)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
            
            self.reserve_two = self.reserve_two
                .checked_sub(amount_out)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
    
            // Transfer tokens to pool
            self.transfer_token_to_pool(
                token_one_accounts.2,
                token_one_accounts.1,
                amount,
                authority,
                token_program,
            )?;
    
            // Transfer SOL to user
            self.transfer_sol_from_pool(
                token_two_accounts.1,
                token_two_accounts.2,
                sol_out_after_fee,
                system_program,
                bump
            )?;
    
            // Transfer SOL fees
            if fee_amount > 0 {
                system_program::transfer(
                    CpiContext::new_with_signer(
                        system_program.to_account_info(),
                        system_program::Transfer {
                            from: token_two_accounts.1.to_account_info(),
                            to: fee_recipient.to_account_info(),
                        },
                        &[&[
                            b"global",
                            &[bump],
                        ]],
                    ),
                    fee_amount,
                )?;
            }
        }
    
        Ok(())
    }

    fn transfer_token_from_pool(
        &self,
        from: &Account<'info, TokenAccount>,
        to: &Account<'info, TokenAccount>,
        amount: u64,
        token_program: &Program<'info, Token>,
        authority: &AccountInfo<'info>,
        bump: u8
    ) -> Result<()> {
        token::transfer(
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                token::Transfer {
                    from: from.to_account_info(),
                    to: to.to_account_info(),
                    authority: authority.to_account_info(),
                },
                &[&[
                    b"global",  
                    &[bump],   
                ]],
            ),
            amount,
        )?;
    
        Ok(())
    }

    fn transfer_token_to_pool(
        &self,
        from: &Account<'info, TokenAccount>,
        to: &Account<'info, TokenAccount>,
        amount: u64,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
    ) -> Result<()> {
        token::transfer(
            CpiContext::new(
                token_program.to_account_info(),
                token::Transfer {
                    from: from.to_account_info(),
                    to: to.to_account_info(),
                    authority: authority.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    fn transfer_sol_from_pool(
        &self,
        from: &AccountInfo<'info>,
        to: &AccountInfo<'info>,
        amount: u64,
        system_program: &Program<'info, System>,
        bump: u8
    ) -> Result<()> {
        system_program::transfer(
            CpiContext::new_with_signer(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: from.to_account_info().clone(),
                    to: to.clone(),
                },
                &[&[
                    b"global", 
                    &[bump],
                ]],
            ),
            amount,
        )?;
    
        Ok(())
    }

    fn transfer_sol_to_pool(
        &self,
        from: &Signer<'info>,
        to: &AccountInfo<'info>,
        amount: u64,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        system_program::transfer(
            CpiContext::new(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: from.to_account_info(),
                    to: to.clone(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    fn add_liquidity_optimized(
        &mut self,
        mint_token_one: &Account<'info, Mint>,
        pool_token_one: &Account<'info, TokenAccount>,
        user_token_one: &Account<'info, TokenAccount>,
        global_account: &AccountInfo<'info>,
        amount_one: u64,
        amount_two: u64,
        liquidity_provider_account: &mut Account<'info, LiquidityProvider>,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>, // Added parameter
    ) -> Result<()> {
        msg!("Adding liquidity: amount_one={}, amount_two={}", amount_one, amount_two);
    
        let shares_to_allocate = if self.total_supply == 0 {
            msg!("Initial liquidity addition.");
            // Directly set shares to amount_one to ensure it's > 0
            amount_one
        } else {
            msg!("Subsequent liquidity addition.");
            let shares_one = amount_one
                .checked_mul(self.total_supply)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?
                .checked_div(self.reserve_one)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

            let shares_two = amount_two
                .checked_mul(self.total_supply)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?
                .checked_div(self.reserve_two)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

            cmp::min(shares_one, shares_two)
        };
    
        msg!("Shares to allocate: {}", shares_to_allocate);
    
        if shares_to_allocate <= 0 {
            msg!("Failed to allocate shares: shares_to_allocate <= 0");
            return err!(CustomError::FailedToAddLiquidity);
        }
    
        self.grant_shares(liquidity_provider_account, shares_to_allocate)?;
        msg!("Granted {} shares to liquidity provider.", shares_to_allocate);
    
        let new_reserves_one = self.reserve_one
            .checked_add(amount_one)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
        let new_reserves_two = self.reserve_two
            .checked_add(amount_two)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

        self.update_reserves(new_reserves_one, new_reserves_two)?;
        msg!("Updated reserves: reserve_one={}, reserve_two={}", new_reserves_one, new_reserves_two);

        self.transfer_token_to_pool(
            user_token_one,
            pool_token_one,
            amount_one,
            authority,
            token_program,
        )?;
        msg!("Transferred {} tokens to pool.", amount_one);

        // Transfer SOL from user to global_account
        self.transfer_sol_to_pool(
            authority,
            global_account,
            amount_two,
            system_program,
        )?;
        msg!("Transferred {} lamports to global_account.", amount_two);

        Ok(())
    }
}
