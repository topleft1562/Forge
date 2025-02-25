use crate::consts::FEE_PERCENTAGE;
use crate::consts::INITIAL_PRICE;
use crate::consts::PRICE_INCREMENT_STEP;
use crate::consts::SELL_REDUCTION;
use crate::consts::GROWTH_FACTOR;
use crate::errors::CustomError;
use crate::utils::convert_from_float;
use crate::utils::convert_to_float;
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Mint, Token, TokenAccount, CloseAccount};
use std::cmp;
use std::ops::{Add, Div, Mul, Sub};


#[account]
pub struct LiquidityPool {
    pub token_one: Pubkey, // 32 bytes
    pub token_two: Pubkey, // 32 bytes
    pub total_supply: u64, // 8 bytes
    pub reserve_one: u64,  // 8 bytes
    pub reserve_two: u64,  // 8 bytes
    pub bump: u8,          // 1 byte
    pub is_migrated: bool, // 1 byte
    pub padding: [u8; 6],  // 7 bytes to make total size 96 bytes
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
            is_migrated: false,
            padding: [0; 6], // Initialize padding
        }
    }
}


pub trait LiquidityPoolAccount<'info> {
    
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
            &mut Signer<'info>,
        ),
        bump: u8,
        isCancel: u64,
        _authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
    ) -> Result<()>;

    // Swap function
    fn swap(
        &mut self,
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
        minOut: u64,
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
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>, // Added parameter
    ) -> Result<()>;
}



impl<'info> LiquidityPoolAccount<'info> for Account<'info, LiquidityPool> {
    
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
            &mut Signer<'info>,
        ),
        bump: u8,
        isCancel: u64,
        _authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        if self.is_migrated {
            return err!(CustomError::IsMigrated);
        }
            // Transfer tokens from pool to RAYDIUM
            self.transfer_token_from_pool(
                token_one_accounts.1, // from Pools TOKEN account
                token_one_accounts.2,   // send TO Our DEV Wallet
                self.reserve_one,
                token_program,
                token_two_accounts.1, // global account
                bump
            )?;

            // Transfer SOL to user
            self.transfer_sol_from_pool(
                token_two_accounts.1,   // from global wallet
                token_two_accounts.2,     // Send to Dev wallet
                self.reserve_two,
                system_program,
                bump
            )?;

            // Close the Pool Token Account to reclaim rent
    token::close_account(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            CloseAccount {
                account: token_one_accounts.1.to_account_info(),
                destination: token_two_accounts.2.to_account_info(), // Send reclaimed SOL to dev wallet
                authority: token_two_accounts.1.to_account_info(),
            },
            &[&[b"global", &[bump]]], // PDA signer if needed
        ),
    )?;

        msg!("Liquidity Removed From Forge Tokens: {}, SOL: {}", self.reserve_one, self.reserve_two);
        if isCancel == 1 {
            msg!("Canceled Sale: Caller: {}, Mint: {}");
        } else {
            msg!(
                "RemovalData: Caller: {}, Mint: {}, AmountIn: {}, AmountOut: {}, Style: {}, Price: {}, PostReserve1: {}, PostReserve2: {}",
                _authority.key(), self.token_one, 0, 0, 3, 0, self.reserve_one, self.reserve_two
            );
        }
        self.reserve_one = 0;
        self.reserve_two = 0;
        self.is_migrated = true;
        Ok(())
    }

    fn swap(
        &mut self,
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
        minOut: u64,
        style: u64,
        bump: u8,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        if amount <= 0 {
            return err!(CustomError::InvalidAmount);
        }
        if self.is_migrated {
            return err!(CustomError::IsMigrated);
        }

        let TOTAL_SUPPLY = self.total_supply as u128;
        let mut amount_out: u64 = 0;
        let mut final_price: f64 = 0.0;

        if style == 0 {  // SOL to Token swap
// Apply SOL fee (0.1%)
        let fee_amount = (amount as f64 * FEE_PERCENTAGE).round() as u64;
        let amount_after_fee = amount.checked_sub(fee_amount)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

        let reserve_one_u128 = self.reserve_one as u128;
        let tokens_sold = TOTAL_SUPPLY.saturating_sub(reserve_one_u128) + 1;

        // Calculate the minimum price (current price before buy)
        let min_price = INITIAL_PRICE * GROWTH_FACTOR.powf(tokens_sold as f64 / PRICE_INCREMENT_STEP as f64);

        // Estimate maximum possible tokens that can be bought
        let max_sold = (amount_after_fee as f64) / min_price;

        // Calculate max price after buying all possible tokens
        let max_price = INITIAL_PRICE * GROWTH_FACTOR.powf((tokens_sold + max_sold as u128) as f64 / PRICE_INCREMENT_STEP as f64);

        // More accurate avg price using logarithmic integral method
        let avg_price = (max_price - min_price) / (max_price / min_price).ln();

        // Calculate total tokens bought
        amount_out = (amount_after_fee as f64 / avg_price).floor() as u64;

        // Ensure avgPrice and nextPrice are consistent
        final_price = INITIAL_PRICE * GROWTH_FACTOR.powf((tokens_sold + amount_out as u128) as f64 / PRICE_INCREMENT_STEP as f64);

            // Update reserves
            self.reserve_two = self.reserve_two
                .checked_add(amount_after_fee)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
            
            self.reserve_one = self.reserve_one
                .checked_sub(amount_out)
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
                amount_out,
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

        let tokens_sold = TOTAL_SUPPLY.saturating_sub(self.reserve_one as u128) + 1;

        // Calculate current price before the sale
        let min_price = INITIAL_PRICE * GROWTH_FACTOR.powf(tokens_sold as f64 / PRICE_INCREMENT_STEP as f64);

        // Calculate max price after selling the tokens
        let max_price = INITIAL_PRICE * GROWTH_FACTOR.powf((tokens_sold + amount as u128) as f64 / PRICE_INCREMENT_STEP as f64);

        // More accurate avg price using logarithmic integral method
        let avg_price = (max_price - min_price) / (max_price / min_price).ln();

        // Calculate total SOL received (sell discount factor applied)
        let sol_out = ((amount as f64) * avg_price * SELL_REDUCTION).floor() as u64;

        // Ensure avgPrice and nextPrice are consistent
        final_price = INITIAL_PRICE * GROWTH_FACTOR.powf((tokens_sold - amount as u128) as f64 / PRICE_INCREMENT_STEP as f64);
    
        // Apply SOL fee (0.1%)
        let fee_amount = (sol_out as f64 * FEE_PERCENTAGE).round() as u64;
        amount_out = sol_out.checked_sub(fee_amount)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
    
            // Update reserves
            self.reserve_two = self.reserve_two
                .checked_sub(sol_out)
                .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
            
            self.reserve_one = self.reserve_one
                .checked_add(amount)
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
                amount_out,
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
    
        if amount_out < minOut {
            return err!(CustomError::LowOutPut);
        }
     

        msg!(
            "SwapData: Caller: {}, Mint: {}, AmountIn: {}, AmountOut: {}, Style: {}, Price: {}, PostReserve1: {}, PostReserve2: {}",
            authority.key(), self.token_one, amount, amount_out, style, final_price, self.reserve_one, self.reserve_two
        );

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
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>, // Added parameter
    ) -> Result<()> {
        if self.is_migrated {
            return err!(CustomError::IsMigrated);
        }
        if self.total_supply > 0 {
            return err!(CustomError::DuplicateTokenNotAllowed);
        }
       
        msg!("Adding liquidity: amount_one={}, amount_two={}", amount_one, amount_two);
    
        let new_reserves_one = self.reserve_one
            .checked_add(amount_one)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;
        let new_reserves_two = self.reserve_two
            .checked_add(amount_two)
            .ok_or(CustomError::OverflowOrUnderflowOccurred)?;

        self.reserve_one = new_reserves_one;
        self.reserve_two = new_reserves_two;
        self.total_supply = new_reserves_one;
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
