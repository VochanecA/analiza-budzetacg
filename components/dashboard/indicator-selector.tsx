'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

  useEffect(() => {
    console.log("Selected indicators:", selectedIndicators);
    console.log("Selected years:", selectedYears);
  }, [selectedIndicators, selectedYears]);

  return (
    <Card className="w-full bg-white shadow-lg border border-gray-200">
      {/* Header sa labelom godina desno */}
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          {/* Lijeva strana: ikona + naslov */}
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg font-semibold text-gray-800">
              Odaberite finansijske indikatore i godine
            </CardTitle>
          </div>

          {/* Desna strana: labela godina */}
          <div className="text-sm font-medium text-gray-700">
            Odaberite godine za poređenje (max 5)
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pretraži indikatore..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Selection Buttons */}
        <div className="flex flex-wrap gap-3">
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

        {/* Year Selector */}
        <ScrollArea className="h-32 border rounded-md p-2 w-48">
          <div className="flex flex-col gap-3 items-end">
            {availableYears.map((year) => (
              <div key={year} className="flex items-center gap-1 justify-end">
                <Checkbox
                  id={`year-${year}`}
                  checked={selectedYears.includes(year)}
                  onCheckedChange={(checked) => handleYearChange(year, !!checked)}
                  disabled={selectedYears.length >= 5 && !selectedYears.includes(year)}
                />
                <Label htmlFor={`year-${year}`} className="text-sm cursor-pointer">
                  {year}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Selected Indicators */}
        {selectedIndicators.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Odabrano ({selectedIndicators.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
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
          </div>
        )}

        {/* Available Indicators */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Dostupni indikatori:
          </h4>
          <ScrollArea className="max-h-64 border rounded-md p-2">
            <div className="flex flex-col gap-2">
              {filteredIndicators.map((indicator) => (
                <div key={indicator} className="flex items-center gap-2">
                  <Checkbox
                    id={indicator}
                    checked={selectedIndicators.includes(indicator)}
                    onCheckedChange={() => toggleIndicator(indicator)}
                  />
                  <label
                    htmlFor={indicator}
                    className="text-sm cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {indicator.replace(/ Euros$/, '').replace(/^[ =]/, '')}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
