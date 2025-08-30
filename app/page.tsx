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
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3, Calculator, Bot, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

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

  const { theme, setTheme } = useTheme();

  const availableMonths = useMemo(() => {
    if (Object.keys(data).length === 0) return [];
    const allMonths = new Set<string>();
    Object.values(data).forEach((indicatorData) => {
      Object.keys(indicatorData).forEach((month) => allMonths.add(month));
    });
    return Array.from(allMonths).sort();
  }, [data]);

  const latestYearMonths = useMemo(() => {
    if (availableMonths.length === 0) return [];
    const years = availableMonths.map((m) => parseInt(m.split('-')[0]));
    const latestYear = Math.max(...years);
    return availableMonths.filter((m) => m.startsWith(latestYear.toString()));
  }, [availableMonths]);

  const availableYears = useMemo(() => {
    if (availableMonths.length === 0) return [];
    const years = new Set(availableMonths.map((m) => m.split('-')[0]));
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
          .filter((m) => m.startsWith(year))
          .forEach((m) => {
            if (data[indicator]?.[m]) {
              grouped[year][indicator][m.split('-')[1]] = data[indicator][m];
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

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Greška pri učitavanju</h1>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  const availableIndicators = Object.keys(data);
  const menuItems = [
    { value: 'trends', label: 'Trendovi', icon: TrendingUp },
    { value: 'comparison', label: 'Analiza', icon: BarChart3 },
    { value: 'simulation', label: 'Simulacija', icon: Calculator },
    { value: 'ai', label: 'AI Uvidi', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 font-sans antialiased">
      
      {/* Header */}
{/* Modern Header */}
<header className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-slate-700">
  <div className="px-4 sm:px-6 lg:px-8 py-3">
    <div className="flex items-center justify-between">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <Image
          src="/icons/favicon.ico"
          alt="Logo"
          width={36}
          height={36}
          className="object-contain"
          priority
        />
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
          Analiza budžeta Crne Gore
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700" />
          )}
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors md:hidden"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
          )}
        </button>
      </div>
    </div>
  </div>

  {/* Mobile Dropdown */}
  {isMobileMenuOpen && (
    <div className="absolute left-0 right-0 top-full bg-white dark:bg-slate-900 shadow-lg border-t border-gray-200 dark:border-slate-700 md:hidden">
      <div className="py-4 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              onClick={() => handleTabChange(item.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.value
                  ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Made by VA
          </p>
        </div>
      </div>
    </div>
  )}
</header>


      <main className="px-4 py-6 space-y-6">
        {/* Pregled */}
        <Card className="shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pregled Dashboarda</CardTitle>
              <button onClick={() => setIsOverviewExpanded(!isOverviewExpanded)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                {isOverviewExpanded ? <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Always visible info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <span className="text-gray-600 dark:text-gray-300">Period: <span className="font-medium">{startDate} - {endDate}</span></span>
                <span className="text-gray-600 dark:text-gray-300 block"><span className="font-medium text-blue-600 dark:text-blue-400">{availableIndicators.length}</span> indikatora</span>
              </div>
              <div className="space-y-2">
                {latestYearMonths.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Najnoviji podaci (2025)</span>
                  </div>
                )}
                <span className="text-gray-600 dark:text-gray-300 block">Upoređivanje: <span className="font-medium">{selectedYears.join(', ') || 'Nije odabrano'}</span></span>
              </div>
            </div>
            {isOverviewExpanded && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 space-y-3">
                <p>Dobrodošli u <span className="font-semibold text-indigo-600 dark:text-indigo-400">Finansijski Dashboard</span> – istražite trendove, analize, simulacije i AI uvide.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filter */}
        <Card className="shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Filteri Podataka</CardTitle>
          </CardHeader>
          <CardContent>
            <IndicatorSelector
              availableIndicators={availableIndicators}
              selectedIndicators={selectedIndicators}
              onSelectionChange={setSelectedIndicators}
              availableYears={availableYears}
              selectedYears={selectedYears}
              onYearSelectionChange={setSelectedYears}
            />
          </CardContent>
        </Card>

        <OverviewCards data={filteredData} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="hidden md:block">
            <TabsList className="grid grid-cols-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-1 rounded-xl shadow">
              {menuItems.map((item) => (
                <TabsTrigger key={item.value} value={item.value} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="md:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {menuItems.map((item) => (
              <button key={item.value} onClick={() => setActiveTab(item.value)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${activeTab === item.value ? 'bg-indigo-600 text-white shadow' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-sm'}`}>
                <item.icon className="h-5 w-5" /> {item.label}
              </button>
            ))}
          </div>

          <TabsContent value="trends" className="mt-6 space-y-6">
            <TimeSeriesChart data={filteredData} selectedIndicators={selectedIndicators} groupedDataByYear={groupedDataByYear} yoyMetrics={yoyMetrics} />
            <StatisticsPanel data={filteredData} selectedIndicators={selectedIndicators} groupedDataByYear={groupedDataByYear} yoyMetrics={yoyMetrics} />
          </TabsContent>
          <TabsContent value="comparison" className="mt-6"><ComparativeAnalysis data={filteredData} selectedIndicators={selectedIndicators} groupedDataByYear={groupedDataByYear} yoyMetrics={yoyMetrics} /></TabsContent>
          <TabsContent value="simulation" className="mt-6"><MonteCarloSimulation data={filteredData} availableIndicators={selectedIndicators.length > 0 ? selectedIndicators : availableIndicators} /></TabsContent>
          <TabsContent value="ai" className="mt-6"><AIInsights data={filteredData} selectedIndicators={selectedIndicators} /></TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white/70 dark:bg-slate-900/70 backdrop-blur mt-8">
        <div className="px-4 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Analiza Budžeta Crne Gore – @Fidelity_cg & VA</p>
          <p className="mt-1">© {new Date().getFullYear()} – Sva prava zadržana</p>
        </div>
      </footer>
    </div>
  );
}
