export interface FinancialData {
  [indicator: string]: {
    [month: string]: number;
  };
}

export interface TimeSeriesPoint {
  month: string;
  value: number;
  indicator: string;
}

export interface StatsSummary {
  total: number;
  average: number;
  min: number;
  max: number;
  growthRate: number;
  standardDeviation: number;
}

export interface MonteCarloResult {
  mean: number;
  standardDeviation: number;
  percentile5: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile95: number;
  simulations: number[];
}

export interface IndicatorCategory {
  name: string;
  indicators: string[];
  color: string;
}