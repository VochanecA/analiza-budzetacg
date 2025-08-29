'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface YearSelectorProps {
  availableYears: string[];
  selectedYears: string[];
  onSelectionChange: (years: string[]) => void;
}

export function YearSelector({ availableYears, selectedYears, onSelectionChange }: YearSelectorProps) {
  const handleChange = (year: string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedYears, year]
      : selectedYears.filter((y) => y !== year);
    onSelectionChange(newSelected.sort((a, b) => parseInt(b) - parseInt(a)));
  };

  return (
    <div className="space-y-2">
      <Label>Iyaberi godine za poređenje(max 5 godina)</Label>
      <ScrollArea className="h-32 border rounded-md p-2">
        {availableYears.map((year) => (
          <div key={year} className="flex items-center space-x-2">
            <Checkbox
              id={year}
              checked={selectedYears.includes(year)}
              onCheckedChange={(checked) => handleChange(year, !!checked)}
              disabled={selectedYears.length >= 5 && !selectedYears.includes(year)}
            />
            <Label htmlFor={year}>{year}</Label>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}