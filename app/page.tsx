'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFinancialData } from '@/hooks/use-financial-data';
import { filterDataByDateRange } from '@/lib/financial-utils';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { TimeSeriesChart } from '@/components/dashboard/time-series-chart';
import { ComparativeAnalysis } from '@/components/dashboard/comparative-analysis';
import { StatisticsPanel } from '@/components/dashboard/statistics-panel';
import { MonteCarloSimulation } from '@/components/dashboard/monte-carlo-simulation';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { IndicatorSelector } from '@/components/dashboard/indicator-selector';
import { DateRangeSelector } from '@/components/dashboard/date-range-selector';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3, Calculator, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FinancialDashboard() {
  const { data, loading, error } = useFinancialData();
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
    'Ukupni Prihodi, Euro',
    'Ukupni Rashodi, Euro',
  ]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const availableMonths = useMemo(() => {
    if (Object.keys(data).length === 0) return [];
    const allMonths = new Set<string>();
    Object.values(data).forEach((indicatorData) => {
      Object.keys(indicatorData).forEach((month) => {
        allMonths.add(month);
      });
    });
    return Array.from(allMonths).sort();
  }, [data]);

  const latestYearMonths = useMemo(() => {
    if (availableMonths.length === 0) return [];
    const years = availableMonths.map((month) => parseInt(month.split('-')[0]));
    const latestYear = Math.max(...years);
    return availableMonths.filter((month) => month.startsWith(latestYear.toString()));
  }, [availableMonths]);

  const availableYears = useMemo(() => {
    if (availableMonths.length === 0) return [];
    const years = new Set(availableMonths.map((month) => month.split('-')[0]));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [availableMonths]);

  useEffect(() => {
    if (availableYears.length > 0) {
      setSelectedYears(availableYears.slice(0, Math.min(2, availableYears.length)));
    }
  }, [availableYears]);

  useEffect(() => {
    if (availableMonths.length > 0) {
      if (latestYearMonths.length > 0) {
        setStartDate(latestYearMonths[0]);
        setEndDate(latestYearMonths[latestYearMonths.length - 1]);
      } else {
        setStartDate(availableMonths[0]);
        setEndDate(availableMonths[availableMonths.length - 1]);
      }
    }
  }, [availableMonths, latestYearMonths]);

  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return data;
    return filterDataByDateRange(data, startDate, endDate);
  }, [data, startDate, endDate]);

  const groupedDataByYear = useMemo(() => {
    const grouped: Record<string, Record<string, Record<string, number>>> = {};
    selectedYears.forEach((year) => {
      grouped[year] = {};
      selectedIndicators.forEach((indicator) => {
        grouped[year][indicator] = {};
        availableMonths
          .filter((month) => month.startsWith(year))
          .forEach((month) => {
            if (data[indicator]?.[month]) {
              grouped[year][indicator][month.split('-')[1]] = data[indicator][month];
            }
          });
      });
    });
    return grouped;
  }, [data, selectedIndicators, selectedYears, availableMonths]);

  const yoyMetrics = useMemo(() => {
    const metrics: Record<string, Record<string, { delta: number; percentChange: number }>> = {};
    if (selectedYears.length < 2) return metrics;

    const sortedYears = [...selectedYears].sort();
    selectedIndicators.forEach((indicator) => {
      metrics[indicator] = {};
      for (let i = 1; i < sortedYears.length; i++) {
        const prevYear = sortedYears[i - 1];
        const currYear = sortedYears[i];
        Object.keys(groupedDataByYear[currYear]?.[indicator] || {}).forEach((month) => {
          const prevValue = groupedDataByYear[prevYear]?.[indicator]?.[month] || 0;
          const currValue = groupedDataByYear[currYear]?.[indicator]?.[month] || 0;
          const delta = currValue - prevValue;
          const percentChange = prevValue !== 0 ? (delta / prevValue) * 100 : 0;
          metrics[indicator][`${month} (${prevYear} vs ${currYear})`] = { delta, percentChange };
        });
      }
    });
    return metrics;
  }, [groupedDataByYear, selectedIndicators, selectedYears]);

  const handleIndicatorSelection = (indicators: string[]) => {
    console.log("Ažuriranje odabranih indikatora:", indicators);
    setSelectedIndicators(indicators);
  };

  const handleYearSelection = (years: string[]) => {
    console.log("Ažuriranje odabranih godina:", years);
    setSelectedYears(years);
  };

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Greška pri učitavanju podataka</h1>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  const availableIndicators = Object.keys(data);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
<header className="border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm sticky top-0 z-10 shadow-md">
  <div className="container mx-auto px-4 py-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Favicon ikona */}
        <img
          src="/icons/favicon.ico"
          alt="Logo"
          className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
        />
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-blue-400">
            Analiza realizacije budžeta Crne Gore
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Analiza u realnom vremenu sa AI-powered analizom
          </p>
        </div>
      </div>

      <div className="text-right space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Period: {startDate} do {endDate}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {availableIndicators.length} indikatora dostupno
        </p>
        {latestYearMonths.length > 0 && (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            Podaci za najnoviju godinu (2025)
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Upoređivanje: {selectedYears.join(', ') || 'Nije odabrano'}
        </p>
      </div>
    </div>
  </div>
</header>


      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full">
            <Card className="w-full h-full shadow-lg bg-white dark:bg-slate-800 border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Filteri Podataka
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <IndicatorSelector
                  availableIndicators={availableIndicators}
                  selectedIndicators={selectedIndicators}
                  onSelectionChange={handleIndicatorSelection}
                  availableYears={availableYears}
                  selectedYears={selectedYears}
                  onYearSelectionChange={handleYearSelection}
                />
                {/* <DateRangeSelector
                  availableMonths={availableMonths}
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                /> */}
              </CardContent>
            </Card>
          </div>
          <div className="w-full">
            <Card className="w-full h-full shadow-lg bg-white dark:bg-slate-800 border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Pregled Dashboarda
                </CardTitle>
              </CardHeader>
    <CardContent className="space-y-6 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-lg p-6 shadow-lg">
  <p className="text-gray-800 dark:text-gray-100 text-lg font-semibold leading-relaxed">
    Dobrodošli u vaš <span className="text-indigo-600 dark:text-indigo-400 font-bold">Finansijski Analitički Dashboard</span>! 
    Koristite filtere iznad za odabir indikatora i vremenskih perioda za detaljnu analizu. 
    Istražite <span className="text-green-600 dark:text-green-400 font-semibold">trendove</span>, 
    <span className="text-blue-600 dark:text-blue-400 font-semibold">komparacije</span>, 
    <span className="text-purple-600 dark:text-purple-400 font-semibold">simulacije</span> i 
    <span className="text-pink-600 dark:text-pink-400 font-semibold">AI-driven uvide</span> kroz više tabova.
  </p>
  <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300 text-md font-medium">
    <li><span className="text-green-700 dark:text-green-400 font-semibold">Trendovi:</span> Vizuelizujte finansijske podatke tokom vremena sa glatkim animacijama.</li>
    <li><span className="text-blue-700 dark:text-blue-400 font-semibold">Analiza:</span> Uporedite performanse između godina uz interaktivne grafikone.</li>
    <li><span className="text-purple-700 dark:text-purple-400 font-semibold">Simulacija:</span> Pokrenite Monte Carlo simulacije za precizna predviđanja.</li>
    <li><span className="text-pink-700 dark:text-pink-400 font-semibold">AI Uvidi:</span> Dobijte AI-generisane finansijske preporuke brzo i efikasno.</li>
  </ul>
</CardContent>

            </Card>
          </div>
        </div>

        <OverviewCards data={filteredData} />

        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
            <TabsTrigger value="trends" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md rounded-md p-2 transition-all text-gray-700 dark:text-gray-300">
              <TrendingUp className="h-5 w-5" />
              Trendovi
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md rounded-md p-2 transition-all text-gray-700 dark:text-gray-300">
              <BarChart3 className="h-5 w-5" />
              Analiza
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md rounded-md p-2 transition-all text-gray-700 dark:text-gray-300">
              <Calculator className="h-5 w-5" />
              Simulacija
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md rounded-md p-2 transition-all text-gray-700 dark:text-gray-300">
              <Bot className="h-5 w-5" />
              AI Uvidi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <TimeSeriesChart
              data={filteredData}
              selectedIndicators={selectedIndicators}
              groupedDataByYear={groupedDataByYear}
              yoyMetrics={yoyMetrics}
            />
            <StatisticsPanel
              data={filteredData}
              selectedIndicators={selectedIndicators}
              groupedDataByYear={groupedDataByYear}
              yoyMetrics={yoyMetrics}
            />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ComparativeAnalysis
              data={filteredData}
              selectedIndicators={selectedIndicators}
              groupedDataByYear={groupedDataByYear}
              yoyMetrics={yoyMetrics}
            />
          </TabsContent>

          <TabsContent value="simulation">
            <MonteCarloSimulation
              data={filteredData}
              availableIndicators={selectedIndicators.length > 0 ? selectedIndicators : availableIndicators}
            />
          </TabsContent>

          <TabsContent value="ai">
            <AIInsights
              data={filteredData}
              selectedIndicators={selectedIndicators}
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Analiza Realizacije budžeta Crne Gore - Code by @Fidelity_cg & VA</p>
            <p className="mt-1">© {new Date().getFullYear()} - Sva prava zadržana</p>
          </div>
        </div>
      </footer>
    </div>
  );
}