'use client';

import { useState, useEffect } from 'react';
import { FinancialData } from '@/types/financial';

interface RawDataItem {
  "INDICATOR Name": string;
  [key: string]: string;
}

export function useFinancialData() {
  const [data, setData] = useState<FinancialData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch financial data');
        }
        const jsonData: RawDataItem[] = await response.json();
        
        // Transform the array format to the expected FinancialData format
        const transformedData: FinancialData = {};
        
        jsonData.forEach(item => {
          const indicatorName = item["INDICATOR Name"];
          const { "INDICATOR Name": _, ...stringValues } = item;
          
          // Convert string values to numbers
          const numericValues: { [month: string]: number } = {};
          
          Object.entries(stringValues).forEach(([month, valueString]) => {
            // Remove commas and convert to number
            const numericValue = parseFloat(valueString.replace(/,/g, ''));
            numericValues[month] = numericValue;
          });
          
          transformedData[indicatorName] = numericValues;
        });
        
        setData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}