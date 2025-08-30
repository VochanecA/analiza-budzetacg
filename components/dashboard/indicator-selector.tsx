'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

interface IndicatorSelectorProps {
  availableIndicators: string[];
  selectedIndicators: string[];
  onSelectionChange: (indicators: string[]) => void;
  availableYears: string[];
  selectedYears: string[];
  onYearSelectionChange: (years: string[]) => void;
}

export function IndicatorSelector({
  availableIndicators,
  selectedIndicators,
  onSelectionChange,
  availableYears,
  selectedYears,
  onYearSelectionChange,
}: IndicatorSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIndicators = availableIndicators.filter((indicator) =>
    indicator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const revenueIndicators = filteredIndicators.filter((indicator) =>
    indicator.toLowerCase().includes("revenue")
  );

  const expenditureIndicators = filteredIndicators.filter((indicator) =>
    indicator.toLowerCase().includes("expenditure")
  );

  const toggleIndicator = (indicator: string) => {
    const newSelection = selectedIndicators.includes(indicator)
      ? selectedIndicators.filter((i) => i !== indicator)
      : [...selectedIndicators, indicator];
    onSelectionChange(newSelection);
  };

  const quickSelect = (keyword: string) => {
    const matches = availableIndicators.filter((indicator) =>
      indicator.toLowerCase().includes(keyword.toLowerCase())
    );
    onSelectionChange(matches);
  };

  const clearAllSelections = () => onSelectionChange([]);

  const handleYearChange = (year: string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedYears, year]
      : selectedYears.filter((y) => y !== year);

    if (newSelected.length <= 5) {
      onYearSelectionChange(newSelected.sort((a, b) => parseInt(b) - parseInt(a)));
    } else {
      alert('Možete odabrati najviše 5 godina za poređenje.');
    }
  };

  useEffect(() => {
    quickSelect("revenue");
  }, []);

  return (
    <div className="space-y-6 w-full">
      {/* Main Card for Search, Years, and Selected */}
      <Card className="bg-white dark:bg-slate-900 shadow-md rounded-xl border border-gray-200 dark:border-slate-700">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Odaberite finansijske indikatore i godine
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white dark:text-red-400 dark:border-red-400 dark:hover:bg-red-500/20 transition-colors"
            onClick={clearAllSelections}
          >
            Očisti sve
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Pretraži indikatore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Years Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Odaberite godine (max 5)
            </span>
            <ScrollArea className="h-16 w-full">
              <div className="flex flex-wrap gap-2 py-2">
                {availableYears.map((year) => (
                  <Badge
                    key={year}
                    variant={selectedYears.includes(year) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1 px-3 rounded-md hover:bg-blue-600 hover:text-white transition-colors min-w-[60px] justify-center"
                    onClick={() => handleYearChange(year, !selectedYears.includes(year))}
                  >
                    {year}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Selected Indicators */}
          {selectedIndicators.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Odabrano ({selectedIndicators.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedIndicators.map((indicator) => (
                  <Badge
                    key={indicator}
                    variant="secondary"
                    className="cursor-pointer text-sm py-1 px-3 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                    onClick={() => toggleIndicator(indicator)}
                  >
                    {indicator.replace(/ Euros$/, '').replace(/^[ =]/, '')} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenues and Expenditures Cards in a Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenues Card */}
        <Card className="bg-blue-50 dark:bg-blue-950 shadow-md rounded-xl border border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Prihodi
              </CardTitle>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"
                onClick={() => quickSelect("revenue")}
              >
                Ostali prihodi
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2"
                onClick={() => quickSelect("tax")}
              >
                Porezi
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32 w-full">
              <div className="flex flex-wrap gap-2 py-2">
                {revenueIndicators.map((indicator) => (
                  <Badge
                    key={indicator}
                    variant={selectedIndicators.includes(indicator) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1 px-3 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                    onClick={() => toggleIndicator(indicator)}
                  >
                    {indicator.replace(/ Euros$/, '').replace(/^[ =]/, '')}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Expenditures Card */}
        <Card className="bg-purple-50 dark:bg-purple-950 shadow-md rounded-xl border border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Rashodi
              </CardTitle>
            </div>
            <Button
              variant="default"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2"
              onClick={() => quickSelect("expenditure")}
            >
              Rashodi
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32 w-full">
              <div className="flex flex-wrap gap-2 py-2">
                {expenditureIndicators.map((indicator) => (
                  <Badge
                    key={indicator}
                    variant={selectedIndicators.includes(indicator) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1 px-3 rounded-md hover:bg-purple-600 hover:text-white transition-colors"
                    onClick={() => toggleIndicator(indicator)}
                  >
                    {indicator.replace(/ Euros$/, '').replace(/^[ =]/, '')}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
