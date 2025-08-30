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
import { TrendingUp, BarChart3, Calculator, Bot, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('trends');
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { value: 'trends', label: 'Trendovi', icon: TrendingUp },
    { value: 'comparison', label: 'Analiza', icon: BarChart3 },
    { value: 'simulation', label: 'Simulacija', icon: Calculator },
    { value: 'ai', label: 'AI Uvidi', icon: Bot },
  ];

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Greška pri učitavanju podataka</h1>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  const availableIndicators = Object.keys(data);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans antialiased">
      {/* Modern Mobile-First Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title - Left Aligned */}
            <div className="flex items-center gap-3">
              <img
                src="/icons/favicon.ico"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Analiza budžeta Crne Gore
              </h1>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="absolute left-0 right-0 top-full bg-white dark:bg-slate-800 shadow-lg border-t md:hidden">
              <div className="py-4 px-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      onClick={() => handleTabChange(item.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.value
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Made by VA
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="px-4 py-6 space-y-6">
        {/* Combined Overview & Info Card */}
        <Card className="shadow-md bg-white dark:bg-slate-800 border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Pregled Dashboarda
              </CardTitle>
              <button
                onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                {isOverviewExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Row - Always Visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Period: <span className="font-medium">{startDate} - {endDate}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-300 block">
                  <span className="font-medium text-blue-600 dark:text-blue-400">{availableIndicators.length}</span> indikatora
                </span>
              </div>
              <div className="space-y-2">
                {latestYearMonths.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Najnoviji podaci (2025)
                    </span>
                  </div>
                )}
                <span className="text-gray-600 dark:text-gray-300 block">
                  Upoređivanje: <span className="font-medium">{selectedYears.length > 0 ? selectedYears.join(', ') : 'Nije odabrano'}</span>
                </span>
              </div>
            </div>

            {/* Expandable Content */}
            {isOverviewExpanded && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Dobrodošli u vaš <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Finansijski Dashboard</span>! 
                  Odaberite indikatore i periode za analizu. Istražite trendove, komparacije, simulacije i AI uvide.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <div><span className="text-green-600 dark:text-green-400 font-medium">Trendovi:</span> Vizuelizacija podataka tokom vremena</div>
                    <div><span className="text-blue-600 dark:text-blue-400 font-medium">Analiza:</span> Uporedite performanse između godina</div>
                  </div>
                  <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                    <div><span className="text-purple-600 dark:text-purple-400 font-medium">Simulacija:</span> Monte Carlo predviđanja</div>
                    <div><span className="text-pink-600 dark:text-pink-400 font-medium">AI Uvidi:</span> AI-generisane preporuke</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filter Card */}
        <Card className="shadow-md bg-white dark:bg-slate-800 border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Filteri Podataka
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <IndicatorSelector
              availableIndicators={availableIndicators}
              selectedIndicators={selectedIndicators}
              onSelectionChange={handleIndicatorSelection}
              availableYears={availableYears}
              selectedYears={selectedYears}
              onYearSelectionChange={handleYearSelection}
            />
          </CardContent>
        </Card>

        <OverviewCards data={filteredData} />

        {/* Modern Mobile-Optimized Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Tab Navigation */}
          <div className="hidden md:block">
            <TabsList className="grid grid-cols-4 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-gray-700 dark:text-gray-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-700 transition-all hover:bg-indigo-100 dark:hover:bg-slate-700 text-sm font-medium"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Mobile Tab Navigation - Horizontal Scrolling */}
          <div className="md:hidden">
            <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === item.value
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-sm hover:bg-indigo-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <TabsContent value="trends" className="space-y-6 mt-6">
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

          <TabsContent value="comparison" className="space-y-6 mt-6">
            <ComparativeAnalysis
              data={filteredData}
              selectedIndicators={selectedIndicators}
              groupedDataByYear={groupedDataByYear}
              yoyMetrics={yoyMetrics}
            />
          </TabsContent>

          <TabsContent value="simulation" className="mt-6">
            <MonteCarloSimulation
              data={filteredData}
              availableIndicators={selectedIndicators.length > 0 ? selectedIndicators : availableIndicators}
            />
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <AIInsights
              data={filteredData}
              selectedIndicators={selectedIndicators}
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-8">
        <div className="px-4 py-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Analiza Realizacije budžeta Crne Gore - Code by @Fidelity_cg & VA</p>
            <p className="mt-1">© {new Date().getFullYear()} - Sva prava zadržana</p>
          </div>
        </div>
      </footer>
    </div>
  );
}