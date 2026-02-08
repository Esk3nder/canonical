const CUSTODIAN_COLORS: Record<string, string> = {
  'Coinbase Prime': '#20808D',
  'Anchorage Digital': '#2E565E',
  BitGo: '#1FB8CD',
  Fireblocks: '#BF505C',
  Copper: '#A84B2F',
  Figment: '#707C36',
}

export function getCustodianColor(name: string): string {
  return CUSTODIAN_COLORS[name] ?? '#13343B'
}
