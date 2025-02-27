import { useEffect, useState } from "react";

// Token amounts (always 6 decimals for pump.fun tokens)
export const formatTokenAmount = (amount: number | string): string => {
    const num = Number(amount) / 1e6;  // Convert to token units

    if (isNaN(num)) return '0';

    // Format large numbers
    if (num >= 1_000_000) return `${(num / 1_000_000).toPrecision(3)}M`;
    if (num >= 1_000) return `${(num / 1_000).toPrecision(3)}k`;

    // If very small, keep 4 decimals
    if (num > 0 && num < 0.0001) return num.toFixed(4);

    // Otherwise, keep 2 significant non-zero digits
    return Number(num.toPrecision(2)).toString();
};


export const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ''); // Removes the comma between date and time
    } catch (error) {
        return dateString;
    }
};

export const formatSOL = (amount: string, adjuster = 1e9): string => {
    const num = Number(amount) / adjuster; // Convert from lamports (default: 9 decimals for SOL)
    
    if (isNaN(num) || num === 0) return '0';
    // Always show up to 10 decimals if value is very small (< 0.0000000001)
    if (num > 0 && num < 0.0000000001) return num.toFixed(10);

    // Convert to a string to prevent scientific notation
    let fixedNum = num.toFixed(9).replace(/\.?0+$/, ""); // Remove trailing zeros

    // Ensure that very small values still keep at least 10 decimals if needed
    if (parseFloat(fixedNum) < 0.000000001) {
        fixedNum = num.toFixed(10);
    }
    // Otherwise, keep 2 significant non-zero digits for larger values
    return fixedNum;
};



// Full numbers for token amounts (6 decimals)
export const formatFullNumber = (amount: number | string): string => {
    const num = Number(amount) / 1e6;  // 6 decimals
    if (isNaN(num)) return '0';
    
    return num.toLocaleString('en-US', {
        maximumFractionDigits: 2
    });
};

export const TimeAgo = (date?: Date | string | null): string => {
    if (!date) return "Just now"; // Handles undefined/null cases

    const createdDate = new Date(date).getTime(); // Convert to timestamp
    if (isNaN(createdDate)) return "Just now"; // Prevents invalid date errors

    const now = Date.now();
    const diffInSeconds = Math.floor((now - createdDate) / 1000);

    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
};

export const getValidURL = (url?: string) => {
    if (!url) return "#"; // Prevents broken links
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
};
