'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialData } from '@/types/financial';
import { formatCurrency } from '@/lib/financial-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown } from "lucide-react";


interface StatisticsPanelProps {
  data: FinancialData;
  selectedIndicators: string[];
  groupedDataByYear: Record<string, Record<string, Record<string, number>>>;
  yoyMetrics: Record<string, Record<string, { delta: number; percentChange: number }>>;
  title?: string;
  description?: string;
}


export function StatisticsPanel({
  data,
  selectedIndicators,
  groupedDataByYear,
  yoyMetrics,
  title = 'Statistička Analiza',
  description = 'Ključne metrike i uporedne analize iz godine u godinu za izabrane pokazatelje',
}: StatisticsPanelProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedDataByYear).length < 2 ? (
          <p className="text-muted-foreground">Izaberite najmanje 2 godine za upoređivanje iz godine u godinu.</p>
        ) : (
          <div className="space-y-6">
            {/* Tekstualna Analiza */}
            <div>
              <h3 className="text-lg font-semibold">Sažetak Iz Godine u Godinu</h3>
              {selectedIndicators.map((indicator) => (
                <div key={indicator}>
                  <h4 className="font-medium">{indicator}</h4>
                  <ul className="list-disc pl-4">
                    {Object.entries(yoyMetrics[indicator] || {}).map(([monthKey, { delta, percentChange }]) => (
                      <li key={monthKey}>
                        {monthKey}: Delta = {formatCurrency(delta)}, Promjena = {percentChange.toFixed(2)}%
                        {percentChange > 0 ? ' (Rast)' : percentChange < 0 ? ' (Pad)' : ' (Bez Promjene)'}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

{/* Numerička Tabela */}
<div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-slate-900">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
    Metrike Iz Godine u Godinu
  </h3>
  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
    <thead className="bg-blue-100 dark:bg-blue-900">
      <tr>
        <th className="px-4 py-2 text-left text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
          Pokazatelj
        </th>
        <th className="px-4 py-2 text-left text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
          Mjesec (Godine)
        </th>
        <th className="px-4 py-2 text-right text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
          Delta
        </th>
        <th className="px-4 py-2 text-right text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
          % Promjena
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
      {selectedIndicators.flatMap((indicator) =>
        Object.entries(yoyMetrics[indicator] || {}).map(([monthKey, { delta, percentChange }], rowIdx) => {
          const isDrop = percentChange < 0;
          return (
            <tr
              key={`${indicator}-${monthKey}`}
              className={`${
                rowIdx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-slate-900'
              } hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors`}
            >
              <td className={`px-4 py-2 text-sm ${isDrop ? 'text-red-600 font-bold' : ''}`}>
                {indicator}
              </td>
              <td className={`px-4 py-2 text-sm ${isDrop ? 'text-red-600 font-bold' : ''}`}>
                {monthKey}
              </td>
              <td className={`px-4 py-2 text-sm text-right ${isDrop ? 'text-red-600 font-bold' : ''}`}>
                {formatCurrency(delta)}
              </td>
              <td className={`px-4 py-2 text-sm text-right flex items-center justify-end gap-1 ${isDrop ? 'text-red-600 font-bold' : ''}`}>
                {percentChange.toFixed(2)}%
                {percentChange > 0 && <ArrowUp className="w-4 h-4 text-green-500" />}
                {percentChange < 0 && <ArrowDown className="w-4 h-4 text-red-500" />}
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
