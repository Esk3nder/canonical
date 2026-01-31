/**
 * PDF Export Service
 *
 * Generates HTML content for PDF rendering of portfolio reports.
 * The HTML output can be converted to PDF via browser print or PDF library.
 */

import type {
  PortfolioSummary,
  ValidatorPerformance,
  MonthlyStatement,
} from '@/domain/types'

/**
 * Formats a bigint gwei value to ETH string
 */
function formatGweiToEth(gwei: bigint): string {
  const eth = Number(gwei) / 1e9
  return eth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

/**
 * Formats a decimal as percentage
 */
function formatPercent(value: number): string {
  return (value * 100).toFixed(2) + '%'
}

/**
 * Formats a date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Formats a date for month/year display
 */
function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}

/**
 * Base styles for PDF documents
 */
const PDF_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    line-height: 1.5;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
  }
  h1 { font-size: 24px; margin-bottom: 8px; color: #111; }
  h2 { font-size: 18px; margin-top: 32px; margin-bottom: 16px; color: #333; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; }
  h3 { font-size: 14px; margin-top: 24px; margin-bottom: 12px; color: #555; }
  .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
  .meta span { margin-right: 16px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .kpi-card { background: #f8f9fa; border-radius: 8px; padding: 16px; text-align: center; }
  .kpi-label { font-size: 12px; color: #666; text-transform: uppercase; }
  .kpi-value { font-size: 24px; font-weight: 600; color: #111; margin-top: 4px; }
  .bucket-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .bucket-card { padding: 12px; border-radius: 6px; }
  .bucket-active { background: #dcfce7; color: #166534; }
  .bucket-transit { background: #dbeafe; color: #1e40af; }
  .bucket-rewards { background: #f3e8ff; color: #6b21a8; }
  .bucket-exiting { background: #ffedd5; color: #c2410c; }
  .bucket-label { font-size: 11px; text-transform: uppercase; }
  .bucket-value { font-size: 16px; font-weight: 600; margin-top: 4px; }
  .bucket-pct { font-size: 11px; opacity: 0.8; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px; }
  th { text-align: left; padding: 8px; border-bottom: 2px solid #e0e0e0; font-weight: 600; color: #333; }
  td { padding: 8px; border-bottom: 1px solid #f0f0f0; }
  tr:hover td { background: #f8f9fa; }
  .text-right { text-align: right; }
  .text-green { color: #16a34a; }
  .text-red { color: #dc2626; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #888; }
  @media print {
    body { padding: 20px; }
    .page-break { page-break-before: always; }
  }
`

/**
 * Generates HTML content for portfolio summary PDF
 */
export function generatePortfolioPDFContent(
  summary: PortfolioSummary,
  methodologyVersion?: string
): string {
  const total = summary.totalValue > 0n ? summary.totalValue : 1n

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio Summary Report</title>
  <style>${PDF_STYLES}</style>
</head>
<body>
  <h1>Portfolio Summary Report</h1>
  <div class="meta">
    <span>Generated: ${formatDate(new Date())}</span>
    <span>As of: ${formatDate(summary.asOfTimestamp)}</span>
    ${methodologyVersion ? `<span>Methodology Version: ${methodologyVersion}</span>` : ''}
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Portfolio Value</div>
      <div class="kpi-value">${formatGweiToEth(summary.totalValue)} ETH</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Blended Staking APY</div>
      <div class="kpi-value">${formatPercent(summary.trailingApy30d)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Validators</div>
      <div class="kpi-value">${summary.validatorCount.toLocaleString()}</div>
    </div>
  </div>

  <h2>State Buckets</h2>
  <div class="bucket-grid">
    <div class="bucket-card bucket-active">
      <div class="bucket-label">Active</div>
      <div class="bucket-value">${formatGweiToEth(summary.stateBuckets.active)} ETH</div>
      <div class="bucket-pct">${formatPercent(Number(summary.stateBuckets.active) / Number(total))}</div>
    </div>
    <div class="bucket-card bucket-transit">
      <div class="bucket-label">In Transit</div>
      <div class="bucket-value">${formatGweiToEth(summary.stateBuckets.inTransit)} ETH</div>
      <div class="bucket-pct">${formatPercent(Number(summary.stateBuckets.inTransit) / Number(total))}</div>
    </div>
    <div class="bucket-card bucket-rewards">
      <div class="bucket-label">Rewards</div>
      <div class="bucket-value">${formatGweiToEth(summary.stateBuckets.rewards)} ETH</div>
      <div class="bucket-pct">${formatPercent(Number(summary.stateBuckets.rewards) / Number(total))}</div>
    </div>
    <div class="bucket-card bucket-exiting">
      <div class="bucket-label">Exiting</div>
      <div class="bucket-value">${formatGweiToEth(summary.stateBuckets.exiting)} ETH</div>
      <div class="bucket-pct">${formatPercent(Number(summary.stateBuckets.exiting) / Number(total))}</div>
    </div>
  </div>

  ${summary.custodianBreakdown.length > 0 ? `
  <h2>Custodian Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Custodian</th>
        <th class="text-right">Value (ETH)</th>
        <th class="text-right">Allocation</th>
        <th class="text-right">APY</th>
        <th class="text-right">Validators</th>
      </tr>
    </thead>
    <tbody>
      ${summary.custodianBreakdown.map(c => `
      <tr>
        <td>${c.custodianName}</td>
        <td class="text-right">${formatGweiToEth(c.value)}</td>
        <td class="text-right">${formatPercent(c.percentage)}</td>
        <td class="text-right">${formatPercent(c.trailingApy30d)}</td>
        <td class="text-right">${c.validatorCount}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    <p>This report was generated automatically. Values are in ETH unless otherwise noted.</p>
  </div>
</body>
</html>`
}

/**
 * Generates HTML for validator schedule table
 */
function generateValidatorScheduleHTML(validators: ValidatorPerformance[]): string {
  if (validators.length === 0) {
    return '<p>No validators in this report period.</p>'
  }

  return `
  <table>
    <thead>
      <tr>
        <th>Pubkey</th>
        <th>Custodian</th>
        <th>Status</th>
        <th class="text-right">Balance (ETH)</th>
        <th class="text-right">APY</th>
        <th class="text-right">Rewards (ETH)</th>
      </tr>
    </thead>
    <tbody>
      ${validators.map(v => `
      <tr>
        <td title="${v.pubkey}">${v.pubkey.slice(0, 10)}...${v.pubkey.slice(-6)}</td>
        <td>${v.custodianName}</td>
        <td>${v.status}</td>
        <td class="text-right">${formatGweiToEth(v.balance)}</td>
        <td class="text-right">${formatPercent(v.trailingApy30d)}</td>
        <td class="text-right ${Number(v.rewardsTotal) > 0 ? 'text-green' : ''}">${formatGweiToEth(v.rewardsTotal)}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  `
}

/**
 * Generates HTML content for monthly statement PDF
 */
export function generateMonthlyStatementPDFContent(statement: MonthlyStatement): string {
  const total = statement.summary.totalValue > 0n ? statement.summary.totalValue : 1n

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Statement - ${formatMonthYear(statement.periodStart)}</title>
  <style>${PDF_STYLES}</style>
</head>
<body>
  <h1>Monthly Statement</h1>
  <div class="meta">
    <span>Report ID: ${statement.reportId}</span>
    <span>Period: ${formatMonthYear(statement.periodStart)}</span>
    <span>Generated: ${formatDate(statement.generatedAt)}</span>
    <span>Methodology Version: ${statement.methodologyVersion}</span>
  </div>

  <h2>Portfolio Summary</h2>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Portfolio Value</div>
      <div class="kpi-value">${formatGweiToEth(statement.summary.totalValue)} ETH</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Blended Staking APY</div>
      <div class="kpi-value">${formatPercent(statement.summary.trailingApy30d)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Validators</div>
      <div class="kpi-value">${statement.summary.validatorCount.toLocaleString()}</div>
    </div>
  </div>

  <h2>State Buckets</h2>
  <div class="bucket-grid">
    <div class="bucket-card bucket-active">
      <div class="bucket-label">Active</div>
      <div class="bucket-value">${formatGweiToEth(statement.summary.stateBuckets.active)} ETH</div>
      <div class="bucket-pct">${formatPercent(Number(statement.summary.stateBuckets.active) / Number(total))}</div>
    </div>
    <div class="bucket-card bucket-transit">
      <div class="bucket-label">In Transit</div>
      <div class="bucket-value">${formatGweiToEth(statement.summary.stateBuckets.inTransit)} ETH</div>
      <div class="bucket-pct">${formatPercent(Number(statement.summary.stateBuckets.inTransit) / Number(total))}</div>
    </div>
    <div class="bucket-card bucket-rewards">
      <div class="bucket-label">Rewards</div>
      <div class="bucket-value">${formatGweiToEth(statement.summary.stateBuckets.rewards)} ETH</div>
      <div class="bucket-pct">${formatPercent(Number(statement.summary.stateBuckets.rewards) / Number(total))}</div>
    </div>
    <div class="bucket-card bucket-exiting">
      <div class="bucket-label">Exiting</div>
      <div class="bucket-value">${formatGweiToEth(statement.summary.stateBuckets.exiting)} ETH</div>
      <div class="bucket-pct">${formatPercent(Number(statement.summary.stateBuckets.exiting) / Number(total))}</div>
    </div>
  </div>

  ${statement.custodianBreakdown.length > 0 ? `
  <h2>Custodian Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Custodian</th>
        <th class="text-right">Value (ETH)</th>
        <th class="text-right">Allocation</th>
        <th class="text-right">APY</th>
        <th class="text-right">Validators</th>
      </tr>
    </thead>
    <tbody>
      ${statement.custodianBreakdown.map(c => `
      <tr>
        <td>${c.custodianName}</td>
        <td class="text-right">${formatGweiToEth(c.value)}</td>
        <td class="text-right">${formatPercent(c.percentage)}</td>
        <td class="text-right">${formatPercent(c.trailingApy30d)}</td>
        <td class="text-right">${c.validatorCount}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${statement.validatorSchedule.length > 0 ? `
  <div class="page-break"></div>
  <h2>Validator Schedule</h2>
  ${generateValidatorScheduleHTML(statement.validatorSchedule)}
  ` : ''}

  ${statement.reconciliation ? `
  <h2>Reconciliation Summary</h2>
  <table>
    <tbody>
      <tr>
        <td>Internal Total</td>
        <td class="text-right">${formatGweiToEth(statement.reconciliation.internalTotal)} ETH</td>
      </tr>
      ${statement.reconciliation.externalTotal !== undefined ? `
      <tr>
        <td>External Total</td>
        <td class="text-right">${formatGweiToEth(statement.reconciliation.externalTotal)} ETH</td>
      </tr>
      ` : ''}
      <tr>
        <td>Variance</td>
        <td class="text-right ${Number(statement.reconciliation.variance) !== 0 ? 'text-red' : ''}">${formatGweiToEth(statement.reconciliation.variance)} ETH</td>
      </tr>
      <tr>
        <td>Variance Percentage</td>
        <td class="text-right">${(statement.reconciliation.variancePercentage * 100).toFixed(4)}%</td>
      </tr>
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    <p>This report was generated automatically. Values are in ETH unless otherwise noted.</p>
    <p>Report ID: ${statement.reportId} | Methodology: ${statement.methodologyVersion}</p>
  </div>
</body>
</html>`
}
