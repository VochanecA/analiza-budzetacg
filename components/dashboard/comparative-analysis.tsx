'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FinancialData } from '@/types/financial';
import { formatCurrency } from '@/lib/financial-utils';
import { createAIClient } from '@/lib/ai';

interface ComparativeAnalysisProps {
  data: FinancialData;
  selectedIndicators: string[];
  groupedDataByYear: Record<string, Record<string, Record<string, number>>>;
  yoyMetrics: Record<string, Record<string, { delta: number; percentChange: number }>>;
  title?: string;
  description?: string;
}

export function ComparativeAnalysis({
  data,
  selectedIndicators,
  groupedDataByYear,
  yoyMetrics,
  title = 'Komparativna analiza',
  description = 'Poređenje finansijskih pokazatelja iz godine u godinu po mesecima',
}: ComparativeAnalysisProps) {
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Skriveno, koristi se samo kod poziva AI-ja
  const defaultQuestion =
    "Napravi jednostavnu i jasnu analizu prikazanih finansijskih podataka sa fokusom na trendove i ključne rizike.";

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  const chartData = months.map((month) => {
    const point: { month: string; [key: string]: string | number } = { month };
    Object.entries(groupedDataByYear).forEach(([year, indicators]) => {
      selectedIndicators.forEach((indicator) => {
        const cleanIndicatorName = `${indicator.replace(/ Euros$/, '').replace(/^[ =]/, '')} (${year})`;
        point[cleanIndicatorName] = indicators[indicator]?.[month] || 0;
      });
    });
    return point;
  });

  const colors = [
    '#3b82f6',
    '#10b981',
    '#ef4444',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
    '#84cc16',
    '#f97316',
  ];

  async function handleAIAnalysis() {
    const client = createAIClient();
    if (!client) {
      setAiResult('AI analiza nije dostupna. Provjerite API ključ.');
      return;
    }

    setLoading(true);
    try {
      const financialDataStr = JSON.stringify(chartData, null, 2); 
      const result = await client.analyzeFinancialData({
        financialData: financialDataStr,
        question: defaultQuestion, // koristi se predefinisano pitanje
        context: "Ovo je vizualizacija finansijskih indikatora kroz godine, prikazana na grafikonu."
      });
      setAiResult(result);
    } catch (err) {
      setAiResult('Greška pri analizi. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleAIAnalysis} disabled={loading}>
              {loading ? 'Analiziram...' : 'Napravi AI Analizu'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedDataByYear).length < 2 ? (
          <p className="text-muted-foreground">Izaberi najmanje 2 godine za poredjenje.</p>
        ) : (
          <div className="h-[400px]">
 {/* @ts-ignore */}
<ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    const [indicator, year] = name.split(' (');
                    const cleanYear = year.slice(0, -1);
                    const prevYear = (parseInt(cleanYear) - 1).toString();
                    const metricKey = `${props.label} (${prevYear} vs ${cleanYear})`;
                    const metric = yoyMetrics[indicator]?.[metricKey];
                    return [
                      formatCurrency(value),
                      metric
                        ? `YoY Delta: ${formatCurrency(metric.delta)}, ${metric.percentChange.toFixed(2)}%`
                        : '',
                    ].filter(Boolean);
                  }}
                />
                <Legend />
                {selectedIndicators.flatMap((indicator, index) =>
                  Object.keys(groupedDataByYear).map((year, yearIndex) => {
                    const cleanIndicatorName = `${indicator.replace(/ Euros$/, '').replace(/^[ =]/, '')} (${year})`;
                    return (
                      <Bar
                        key={`${indicator}-${year}`}
                        dataKey={cleanIndicatorName}
                        fill={colors[(index * Object.keys(groupedDataByYear).length + yearIndex) % colors.length]}
                      />
                    );
                  })
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {aiResult && (
          <div className="mt-4 p-4 border rounded-md bg-muted">
            <h3 className="font-semibold mb-2">AI Analiza:</h3>
            <p className="whitespace-pre-line text-sm">{aiResult}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
