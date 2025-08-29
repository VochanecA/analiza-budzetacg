'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialData } from '@/types/financial';
import { formatCurrency } from '@/lib/financial-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


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
            <div>
              <h3 className="text-lg font-semibold">Metrike Iz Godine u Godinu</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pokazatelj</TableHead>
                    <TableHead>Mjesec (Godine)</TableHead>
                    <TableHead>Delta</TableHead>
                    <TableHead>% Promjena</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedIndicators.flatMap((indicator) =>
                    Object.entries(yoyMetrics[indicator] || {}).map(([monthKey, { delta, percentChange }]) => (
                      <TableRow key={`${indicator}-${monthKey}`}>
                        <TableCell>{indicator}</TableCell>
                        <TableCell>{monthKey}</TableCell>
                        <TableCell>{formatCurrency(delta)}</TableCell>
                        <TableCell>{percentChange.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
