import { Suspense } from 'react'

// Placeholder components - will be implemented in Phase 4
function KPIBands() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="kpi-band" data-testid="portfolio-value">
        <div className="kpi-label">Total Portfolio Value</div>
        <div className="kpi-value">$—</div>
      </div>
      <div className="kpi-band" data-testid="trailing-apy">
        <div className="kpi-label">Trailing APY (30d)</div>
        <div className="kpi-value">—%</div>
      </div>
      <div className="kpi-band" data-testid="validator-count">
        <div className="kpi-label">Validators</div>
        <div className="kpi-value">—</div>
      </div>
    </div>
  )
}

function StateBuckets() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="state-bucket" data-testid="active-stake">
        <div className="text-sm font-medium text-slate-500">Active</div>
        <div className="text-xl font-semibold text-slate-900">$—</div>
        <div className="text-xs text-slate-400">— validators</div>
      </div>
      <div className="state-bucket" data-testid="in-transit-stake">
        <div className="text-sm font-medium text-slate-500">In Transit</div>
        <div className="text-xl font-semibold text-slate-900">$—</div>
        <div className="text-xs text-slate-400">— validators</div>
      </div>
      <div className="state-bucket" data-testid="rewards">
        <div className="text-sm font-medium text-slate-500">Rewards</div>
        <div className="text-xl font-semibold text-slate-900">$—</div>
        <div className="text-xs text-slate-400">unclaimed</div>
      </div>
      <div className="state-bucket" data-testid="exiting-stake">
        <div className="text-sm font-medium text-slate-500">Exiting</div>
        <div className="text-xl font-semibold text-slate-900">$—</div>
        <div className="text-xs text-slate-400">— validators</div>
      </div>
    </div>
  )
}

function CustodianDistribution() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Custodian Distribution</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart placeholder */}
        <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
          Allocation Chart
        </div>
        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Custodian</th>
                <th>Value</th>
                <th>APY</th>
                <th>7d Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="text-center text-slate-400 py-8">
                  No data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ValidatorPerformance() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Validator Performance</h2>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Validator</th>
              <th>Operator</th>
              <th>Status</th>
              <th>Balance</th>
              <th>APY</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center text-slate-400 py-8">
                No validators found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ExceptionSummary() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Exceptions</h2>
        <a href="/exceptions" className="text-sm text-primary-600 hover:text-primary-800">
          View all →
        </a>
      </div>
      <div className="text-center text-slate-400 py-8">
        No exceptions detected
      </div>
    </div>
  )
}

export default function PortfolioOverview() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Portfolio Overview</h1>
        <p className="text-slate-500">Institutional staking dashboard</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        {/* Above the fold: KPIs + State Buckets + Custodian Distribution */}
        <KPIBands />
        <StateBuckets />
        <CustodianDistribution />

        {/* Below the fold: Validators + Exceptions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ValidatorPerformance />
          </div>
          <div>
            <ExceptionSummary />
          </div>
        </div>
      </Suspense>
    </div>
  )
}
