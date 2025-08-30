import { FinancialData, StatsSummary, MonteCarloResult } from "@/types/financial";

// 🔧 ISPRAVKA 1: Pravilno formatiranje za Crnu Goru/EU
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('sr-Latn-ME', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('sr-Latn-ME', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// 🔧 ISPRAVKA 2: Poboljšana statistička analiza
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
  
  // 🔧 ISPRAVKA: Poboljšana growth rate kalkulacija
  const growthRate = calculateGrowthRate(values);

  // 🔧 ISPRAVKA: Sample standard deviation umesto population
  const sampleStandardDeviation = calculateSampleStandardDeviation(values, average);

  return {
    total,
    average,
    min,
    max,
    growthRate,
    standardDeviation: sampleStandardDeviation,
  };
}

// 🆕 NOVA FUNKCIJA: Pravilna kalkulacija growth rate
function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0;
  
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  
  // Handle edge cases za budžetske podatke
  if (firstValue === 0) {
    return lastValue > 0 ? 100 : 0; // 100% rast ako je bilo 0, sada pozitivno
  }
  
  // Standardna CAGR formula za finansijske podatke
  const periodsCount = values.length - 1;
  const growthRate = (Math.pow(Math.abs(lastValue) / Math.abs(firstValue), 1 / periodsCount) - 1) * 100;
  
  // Proverava da li je trend pozitivan ili negativan
  const trendMultiplier = (lastValue >= 0 && firstValue >= 0) || (lastValue < 0 && firstValue < 0) ? 1 : -1;
  
  return isFinite(growthRate) ? growthRate * trendMultiplier : 0;
}

// 🆕 NOVA FUNKCIJA: Sample standard deviation
function calculateSampleStandardDeviation(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1); // n-1 za sample
  return Math.sqrt(variance);
}

// 🔧 ISPRAVKA 3: Ažurirane kategorije indikatora za srpski/crnogorski
export function getIndicatorCategories(): Array<{ name: string; indicators: string[]; color: string }> {
  return [
    {
      name: "Prihodi",
      indicators: [
        "Ukupni Prihodi, Euro",
        "Porezi, Euro", 
        "Doprinosi, Euro",
        "Carine, Euro",
        "Takse, Euro",
        "Ostali prihodi, Euro",
        "Grantovi i transferi, Euro"
      ],
      color: "#10b981"
    },
    {
      name: "Porezi - Detaljno",
      indicators: [
        "Porez na lična primanja, Euro",
        "Porez na dobit preduzeća, Euro", 
        "Porez na dodatu vrijednost, Euro",
        "Akcize, Euro",
        "Porez na međunarodnu trgovinu i transakcije, Euro",
        "Ostali republikanski porezi, Euro"
      ],
      color: "#3b82f6"
    },
    {
      name: "Rashodi",
      indicators: [
        "Ukupni Rashodi, Euro",
        "Tekući rashodi, Euro",
        "Kapitalni rashodi, Euro", 
        "Transferi za socijalno osiguranje, Euro"
      ],
      color: "#ef4444"
    },
    {
      name: "Rashodi - Detaljno",
      indicators: [
        "Bruto plate i doprinosi, Euro",
        "Rashodi za usluge, Euro",
        "Rashodi za materijal, Euro",
        "Tekuće održavanje, Euro",
        "Kamata, Euro",
        "Subvencije, Euro"
      ],
      color: "#f59e0b"
    },
    {
      name: "Bilans i Finansiranje",
      indicators: [
        "Suficit / deficit, Euro",
        "Primarni bilans, Euro",
        "Finansiranje, Euro",
        "Potrebe za finansiranjem, Euro"
      ],
      color: "#8b5cf6"
    }
  ];
}

// 🔧 ISPRAVKA 4: Poboljšana Monte Carlo simulacija
export function runMonteCarloSimulation(
  historicalValues: number[],
  periods: number = 12,
  simulations: number = 10000
): MonteCarloResult {
  if (historicalValues.length < 3) { // Povećano sa 2 na 3 za bolju statistiku
    throw new Error("Potrebno je najmanje 3 istorijske vrednosti za simulaciju");
  }

  // 🆕 Filtriramo outliere i validiramo podatke
  const cleanedValues = removeOutliers(historicalValues);
  const returns = calculateReturns(cleanedValues);

  if (returns.length === 0) {
    throw new Error("Nije moguće izračunati prinose na osnovu istorijskih vrednosti");
  }

  const { meanReturn, stdDev } = calculateReturnStatistics(returns);
  
  // 🆕 Dodajemo volatilnost adjustment za budžetske podatke
  const adjustedStdDev = Math.min(stdDev, 0.5); // Maksimalno 50% volatilnost po periodu
  
  const finalValues: number[] = [];
  const lastValue = cleanedValues[cleanedValues.length - 1];

  for (let sim = 0; sim < simulations; sim++) {
    let value = lastValue;
    
    for (let period = 0; period < periods; period++) {
      const randomReturn = randomNormal(meanReturn, adjustedStdDev);
      
      // 🆕 Dodajemo bounds za realističnost budžetskih projekcija
      const boundedReturn = Math.max(-0.8, Math.min(2.0, randomReturn)); // -80% do +200%
      value = Math.max(0, value * (1 + boundedReturn)); // Budžet ne može biti negativan
    }
    
    finalValues.push(value);
  }

  finalValues.sort((a, b) => a - b);

  return {
    mean: finalValues.reduce((sum, val) => sum + val, 0) / finalValues.length,
    standardDeviation: calculateSampleStandardDeviation(finalValues, finalValues.reduce((sum, val) => sum + val, 0) / finalValues.length),
    percentile5: finalValues[Math.floor(simulations * 0.05)],
    percentile25: finalValues[Math.floor(simulations * 0.25)],
    percentile50: finalValues[Math.floor(simulations * 0.50)],
    percentile75: finalValues[Math.floor(simulations * 0.75)],
    percentile95: finalValues[Math.floor(simulations * 0.95)],
    simulations: finalValues.slice(0, 1000), // Vraćamo samo 1000 za performanse
  };
}

// 🆕 NOVA FUNKCIJA: Uklanjanje outliera
function removeOutliers(values: number[]): number[] {
  if (values.length < 4) return values;
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(val => val >= lowerBound && val <= upperBound);
}

// 🆕 NOVA FUNKCIJA: Kalkulacija prinosa
function calculateReturns(values: number[]): number[] {
  const returns = [];
  for (let i = 1; i < values.length; i++) {
    const prevValue = values[i - 1];
    if (Math.abs(prevValue) > 0.01) { // Izbegavamo deljenje sa praktično nulom
      const returnRate = (values[i] - prevValue) / Math.abs(prevValue);
      if (isFinite(returnRate)) {
        returns.push(returnRate);
      }
    }
  }
  return returns;
}

// 🆕 NOVA FUNKCIJA: Statistika prinosa
function calculateReturnStatistics(returns: number[]): { meanReturn: number; stdDev: number } {
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  
  return { meanReturn, stdDev };
}

// ✅ Box-Muller ostaje isti - matematički tačan
function randomNormal(mean: number = 0, stdDev: number = 1): number {
  let u1 = 0;
  let u2 = 0;
  
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// ✅ Filter funkcija ostaje ista - logički ispravna
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

// ✅ Date range funkcija ostaje ista - ispravna
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

// 🆕 BONUS: Funkcija za analizu budžetskih trendova
export function analyzeBudgetTrend(values: number[]): {
  trend: 'rastući' | 'opadajući' | 'stabilan';
  volatilnost: 'niska' | 'umerena' | 'visoka';
  sezonalnost: boolean;
} {
  if (values.length < 12) {
    return { trend: 'stabilan', volatilnost: 'niska', sezonalnost: false };
  }

  const stats = calculateStats(values);
  const growthRate = Math.abs(stats.growthRate);
  const cv = stats.standardDeviation / Math.abs(stats.average); // Coefficient of variation

  const trend = growthRate > 5 ? (stats.growthRate > 0 ? 'rastući' : 'opadajući') : 'stabilan';
  const volatilnost = cv > 0.3 ? 'visoka' : cv > 0.15 ? 'umerena' : 'niska';
  
  // Jednostavna detekcija sezonalnosti (mesečna ciklična varijacija)
  const sezonalnost = values.length >= 24 ? detectSeasonality(values) : false;

  return { trend, volatilnost, sezonalnost };
}

function detectSeasonality(values: number[]): boolean {
  // Poredimo Q4 vs Q1-Q3 proseke za detekciju sezonskih obrazaca u budžetu
  const quarterlyAverages = [];
  for (let i = 0; i < 4; i++) {
    const quarterValues = values.filter((_, index) => index % 12 >= i * 3 && index % 12 < (i + 1) * 3);
    if (quarterValues.length > 0) {
      quarterlyAverages.push(quarterValues.reduce((sum, val) => sum + val, 0) / quarterValues.length);
    }
  }
  
  if (quarterlyAverages.length < 4) return false;
  
  const maxQuarter = Math.max(...quarterlyAverages);
  const minQuarter = Math.min(...quarterlyAverages);
  
  return (maxQuarter - minQuarter) / minQuarter > 0.2; // 20% razlika ukazuje na sezonalnost
}