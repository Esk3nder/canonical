/**
 * Formatting utilities for the staking dashboard
 */

/**
 * Formats a wei/gwei string to ETH with appropriate decimal places
 */
export function formatEther(weiString: string, decimals = 2): string {
  try {
    const wei = BigInt(weiString)
    // Assuming input is in gwei (10^9), convert to ETH (10^18)
    // If the number is very large, it's likely in wei already
    const isWei = weiString.length > 15

    if (isWei) {
      // Convert from wei (10^18)
      const eth = Number(wei) / 1e18
      return formatNumber(eth, decimals)
    } else {
      // Convert from gwei (10^9)
      const eth = Number(wei) / 1e9
      return formatNumber(eth, decimals)
    }
  } catch {
    return '0.00'
  }
}

/**
 * Formats a number with commas and specified decimal places
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Formats a percentage value (0.05 -> "5.00%")
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Formats a date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Shortens a hex string (pubkey, address) for display
 */
export function shortenHex(hex: string, chars = 6): string {
  if (hex.length <= chars * 2 + 2) return hex
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`
}

/**
 * Formats a bigint string with K/M/B suffixes
 */
export function formatCompact(value: string | number): string {
  const num = typeof value === 'string' ? Number(value) : value

  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B`
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M`
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K`
  }
  return num.toLocaleString()
}
