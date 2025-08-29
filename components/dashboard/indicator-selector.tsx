'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

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

  // Selektuj prihode po defaultu pri prvom renderu
  useEffect(() => {
    quickSelect("revenue");
  }, []); // prazna lista zavisnosti znači da se izvršava samo jednom

  useEffect(() => {
    console.log("Selected indicators:", selectedIndicators);
    console.log("Selected years:", selectedYears);
  }, [selectedIndicators, selectedYears]);

  return (
    <Card className="w-full bg-white shadow-lg border border-gray-200">
      {/* Header */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-500" />
          <CardTitle className="text-lg font-semibold text-gray-800">
            Odaberite finansijske indikatore i godine
          </CardTitle>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Quick selection buttons */}
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => quickSelect("revenue")}
          >
            Prihodi
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => quickSelect("tax")}
          >
            Porezi
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => quickSelect("expenditure")}
          >
            Rashodi
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
            onClick={clearAllSelections}
          >
            Očisti sve
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative w-full max-w-md mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Pretraži indikatore..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border rounded-md w-full py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Years scrollable horizontal */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Odaberite godine (max 5)</span>
          <ScrollArea className="h-12 w-full">
            <div className="flex gap-2 py-1">
              {availableYears.map((year) => (
                <Badge
                  key={year}
                  variant={selectedYears.includes(year) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                  onClick={() =>
                    handleYearChange(year, !selectedYears.includes(year))
                  }
                >
                  {year}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Indicators scrollable horizontal */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Dostupni indikatori</span>
          <ScrollArea className="h-16 w-full">
            <div className="flex gap-2 py-1 flex-wrap">
              {filteredIndicators.map((indicator) => (
                <Badge
                  key={indicator}
                  variant={selectedIndicators.includes(indicator) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-green-600 hover:text-white transition-colors"
                  onClick={() => toggleIndicator(indicator)}
                >
                  {indicator.replace(/ Euros$/, '').replace(/^[ =]/, '')}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Selected indicators */}
        {selectedIndicators.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-sm font-medium text-gray-700">Odabrano ({selectedIndicators.length}):</span>
            {selectedIndicators.map((indicator) => (
              <Badge
                key={indicator}
                variant="secondary"
                className="cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                onClick={() => toggleIndicator(indicator)}
              >
                {indicator.replace(/ Euros$/, '').replace(/^[ =]/, '')} ×
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
