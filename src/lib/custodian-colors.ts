const CUSTODIAN_COLORS: Record<string, string> = {
  'Coinbase Prime': '#2563eb',
  'Anchorage Digital': '#16a34a',
  BitGo: '#9333ea',
  Fireblocks: '#ea580c',
  Copper: '#0891b2',
  Figment: '#f59e0b',
}

export function getCustodianColor(name: string): string {
  return CUSTODIAN_COLORS[name] ?? '#6b7280'
}
