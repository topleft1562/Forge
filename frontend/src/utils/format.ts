// Token amounts (always 6 decimals for pump.fun tokens)
export const formatTokenAmount = (amount: number | string): string => {
    const num = Number(amount) / 1e6;  // 6 decimals
    
    if (isNaN(num)) return '0';
    
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(2)}k`;
    }
    return num.toFixed(2);
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

export const formatSOL = (amount: number | string): string => {
    const num = Number(amount) / 1e9; // 9 decimals for SOL
    return isNaN(num) ? '0' : num.toFixed(2); 
};

// Full numbers for token amounts (6 decimals)
export const formatFullNumber = (amount: number | string): string => {
    const num = Number(amount) / 1e6;  // 6 decimals
    if (isNaN(num)) return '0';
    
    return num.toLocaleString('en-US', {
        maximumFractionDigits: 2
    });
};