"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromCode = exports.OverflowOrUnderflowOccurred = exports.FailedToRemoveLiquidity = exports.FailedToAddLiquidity = exports.InvalidFee = exports.InvalidAmount = exports.InsufficientFunds = exports.InsufficientShares = exports.FailedToDeallocateShares = exports.FailedToAllocateShares = exports.DuplicateTokenNotAllowed = void 0;
class DuplicateTokenNotAllowed extends Error {
    constructor(logs) {
        super("6000: Duplicate tokens are not allowed");
        this.logs = logs;
        this.code = 6000;
        this.name = "DuplicateTokenNotAllowed";
        this.msg = "Duplicate tokens are not allowed";
    }
}
exports.DuplicateTokenNotAllowed = DuplicateTokenNotAllowed;
DuplicateTokenNotAllowed.code = 6000;
class FailedToAllocateShares extends Error {
    constructor(logs) {
        super("6001: Failed to allocate shares");
        this.logs = logs;
        this.code = 6001;
        this.name = "FailedToAllocateShares";
        this.msg = "Failed to allocate shares";
    }
}
exports.FailedToAllocateShares = FailedToAllocateShares;
FailedToAllocateShares.code = 6001;
class FailedToDeallocateShares extends Error {
    constructor(logs) {
        super("6002: Failed to deallocate shares");
        this.logs = logs;
        this.code = 6002;
        this.name = "FailedToDeallocateShares";
        this.msg = "Failed to deallocate shares";
    }
}
exports.FailedToDeallocateShares = FailedToDeallocateShares;
FailedToDeallocateShares.code = 6002;
class InsufficientShares extends Error {
    constructor(logs) {
        super("6003: Insufficient shares");
        this.logs = logs;
        this.code = 6003;
        this.name = "InsufficientShares";
        this.msg = "Insufficient shares";
    }
}
exports.InsufficientShares = InsufficientShares;
InsufficientShares.code = 6003;
class InsufficientFunds extends Error {
    constructor(logs) {
        super("6004: Insufficient funds to swap");
        this.logs = logs;
        this.code = 6004;
        this.name = "InsufficientFunds";
        this.msg = "Insufficient funds to swap";
    }
}
exports.InsufficientFunds = InsufficientFunds;
InsufficientFunds.code = 6004;
class InvalidAmount extends Error {
    constructor(logs) {
        super("6005: Invalid amount to swap");
        this.logs = logs;
        this.code = 6005;
        this.name = "InvalidAmount";
        this.msg = "Invalid amount to swap";
    }
}
exports.InvalidAmount = InvalidAmount;
InvalidAmount.code = 6005;
class InvalidFee extends Error {
    constructor(logs) {
        super("6006: Invalid fee");
        this.logs = logs;
        this.code = 6006;
        this.name = "InvalidFee";
        this.msg = "Invalid fee";
    }
}
exports.InvalidFee = InvalidFee;
InvalidFee.code = 6006;
class FailedToAddLiquidity extends Error {
    constructor(logs) {
        super("6007: Failed to add liquidity");
        this.logs = logs;
        this.code = 6007;
        this.name = "FailedToAddLiquidity";
        this.msg = "Failed to add liquidity";
    }
}
exports.FailedToAddLiquidity = FailedToAddLiquidity;
FailedToAddLiquidity.code = 6007;
class FailedToRemoveLiquidity extends Error {
    constructor(logs) {
        super("6008: Failed to remove liquidity");
        this.logs = logs;
        this.code = 6008;
        this.name = "FailedToRemoveLiquidity";
        this.msg = "Failed to remove liquidity";
    }
}
exports.FailedToRemoveLiquidity = FailedToRemoveLiquidity;
FailedToRemoveLiquidity.code = 6008;
class OverflowOrUnderflowOccurred extends Error {
    constructor(logs) {
        super("6009: Overflow or underflow occured");
        this.logs = logs;
        this.code = 6009;
        this.name = "OverflowOrUnderflowOccurred";
        this.msg = "Overflow or underflow occured";
    }
}
exports.OverflowOrUnderflowOccurred = OverflowOrUnderflowOccurred;
OverflowOrUnderflowOccurred.code = 6009;
function fromCode(code, logs) {
    switch (code) {
        case 6000:
            return new DuplicateTokenNotAllowed(logs);
        case 6001:
            return new FailedToAllocateShares(logs);
        case 6002:
            return new FailedToDeallocateShares(logs);
        case 6003:
            return new InsufficientShares(logs);
        case 6004:
            return new InsufficientFunds(logs);
        case 6005:
            return new InvalidAmount(logs);
        case 6006:
            return new InvalidFee(logs);
        case 6007:
            return new FailedToAddLiquidity(logs);
        case 6008:
            return new FailedToRemoveLiquidity(logs);
        case 6009:
            return new OverflowOrUnderflowOccurred(logs);
    }
    return null;
}
exports.fromCode = fromCode;
