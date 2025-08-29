import { FinancialData, StatsSummary, MonteCarloResult } from "@/types/financial";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-EU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateStats(values: number[]): StatsSummary {
  if (values.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      growthRate: 0,
      standardDeviation: 0,
    };
  }

  const total = values.reduce((sum, val) => sum + val, 0);
  const average = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Calculate growth rate (first to last)
  const growthRate = values.length > 1 
    ? ((values[values.length - 1] - values[0]) / Math.abs(values[0])) * 100 
    : 0;

  // Calculate standard deviation
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  return {
    total,
    average,
    min,
    max,
    growthRate,
    standardDeviation,
  };
}

export function getIndicatorCategories(): Array<{ name: string; indicators: string[]; color: string }> {
  return [
    {
      name: "Revenues",
      indicators: [
        " Total Revenues, Euros",
        " Taxes, Euros",
        " Contributions, Euros",
        " Duties, Euros",
        " Fees, Euros",
        " Other revenues, Euros",
        " Grants and Transfers, Euros"
      ],
      color: "#10b981"
    },
    {
      name: "Tax Breakdown",
      indicators: [
        " Personal Income Tax, Euros",
        " Corporate Income Tax, Euros",
        " Value Added Tax, Euros",
        " Excises, Euros",
        " Tax on International Trade and Transactions, Euros",
        " Other Republic Taxes, Euros"
      ],
      color: "#3b82f6"
    },
    {
      name: "Expenditures",
      indicators: [
        " Total Expenditures, Euros",
        " Current Expenditures, Euros",
        " Capital Expenditure, Euros",
        " Social Security Transfers, Euros"
      ],
      color: "#ef4444"
    },
    {
      name: "Detailed Expenditures",
      indicators: [
        " Gross Salaries and Contributions, Euros",
        " Expenditures for Services, Euros",
        " Expenditures for Supplies, Euros",
        " Current Maintenance, Euros",
        " Interests, Euros",
        " Subsidies, Euros"
      ],
      color: "#f59e0b"
    },
    {
      name: "Balance & Financing",
      indicators: [
        " Surplus / deficit, Euros",
        " Primary balance, Euros",
        " Financing, Euros",
        " Financing needs, Euros"
      ],
      color: "#8b5cf6"
    }
  ];
}

export function runMonteCarloSimulation(
  historicalValues: number[],
  periods: number = 12,
  simulations: number = 10000
): MonteCarloResult {
  if (historicalValues.length < 2) {
    throw new Error("Need at least 2 historical values for simulation");
  }

  const returns = [];
  for (let i = 1; i < historicalValues.length; i++) {
    const prevValue = historicalValues[i - 1];
    if (prevValue !== 0) {
      returns.push((historicalValues[i] - prevValue) / Math.abs(prevValue));
    }
  }

  if (returns.length === 0) {
    throw new Error("Cannot calculate returns from historical values");
  }

  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  const finalValues: number[] = [];
  const lastValue = historicalValues[historicalValues.length - 1];

  for (let sim = 0; sim < simulations; sim++) {
    let value = lastValue;
    
    for (let period = 0; period < periods; period++) {
      const randomReturn = randomNormal(meanReturn, stdDev);
      value = value * (1 + randomReturn);
    }
    
    finalValues.push(value);
  }

  finalValues.sort((a, b) => a - b);

  return {
    mean: finalValues.reduce((sum, val) => sum + val, 0) / finalValues.length,
    standardDeviation: Math.sqrt(
      finalValues.reduce((sum, val) => {
        const mean = finalValues.reduce((s, v) => s + v, 0) / finalValues.length;
        return sum + Math.pow(val - mean, 2);
      }, 0) / finalValues.length
    ),
    percentile5: finalValues[Math.floor(simulations * 0.05)],
    percentile25: finalValues[Math.floor(simulations * 0.25)],
    percentile50: finalValues[Math.floor(simulations * 0.50)],
    percentile75: finalValues[Math.floor(simulations * 0.75)],
    percentile95: finalValues[Math.floor(simulations * 0.95)],
    simulations: finalValues,
  };
}

// Box-Muller transform for generating normal distribution
function randomNormal(mean: number = 0, stdDev: number = 1): number {
  let u1 = 0;
  let u2 = 0;
  
  while (u1 === 0) u1 = Math.random(); // Converting [0,1) to (0,1)
  while (u2 === 0) u2 = Math.random();
  
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

export function filterDataByDateRange(
  data: FinancialData,
  startDate: string,
  endDate: string
): FinancialData {
  const filtered: FinancialData = {};
  
  Object.entries(data).forEach(([indicator, monthlyData]) => {
    const filteredMonthly: { [month: string]: number } = {};
    
    Object.entries(monthlyData).forEach(([month, value]) => {
      if (month >= startDate && month <= endDate) {
        filteredMonthly[month] = value;
      }
    });
    
    if (Object.keys(filteredMonthly).length > 0) {
      filtered[indicator] = filteredMonthly;
    }
  });
  
  return filtered;
}

export function getAvailableDateRange(data: FinancialData): { start: string; end: string } {
  const allMonths = new Set<string>();
  
  Object.values(data).forEach(monthlyData => {
    Object.keys(monthlyData).forEach(month => allMonths.add(month));
  });
  
  const sortedMonths = Array.from(allMonths).sort();
  
  return {
    start: sortedMonths[0] || "",
    end: sortedMonths[sortedMonths.length - 1] || "",
  };
}