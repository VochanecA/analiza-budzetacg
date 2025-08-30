'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinancialData } from '@/types/financial';
import { formatCurrency } from '@/lib/financial-utils';

interface TimeSeriesChartProps {
  data: FinancialData;
  selectedIndicators: string[];
  groupedDataByYear: Record<string, Record<string, Record<string, number>>>;
  yoyMetrics: Record<string, Record<string, { delta: number; percentChange: number }>>;
  title?: string;
  description?: string;
}

export function TimeSeriesChart({
  data,
  selectedIndicators,
  groupedDataByYear,
  yoyMetrics,
  title = 'Finansijski trendovi tokom vremena',
  description = 'Pratite ključne finansijske indikatore mesečno uz poređenja iz godine u godinu',
}: TimeSeriesChartProps) {
  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  const chartData = useMemo(() => {
    if (selectedIndicators.length === 0) return [];

    return months.map(month => {
      const point: { month: string; [key: string]: string | number } = { month };
      Object.entries(groupedDataByYear).forEach(([year, indicators]) => {
        selectedIndicators.forEach(indicator => {
          const cleanIndicatorName = `${indicator.replace(/ Euros$/, '').replace(/^[ =]/,'')} (${year})`;
          point[cleanIndicatorName] = indicators[indicator]?.[month] || 0;
        });
      });
      return point;
    });
  }, [groupedDataByYear, selectedIndicators]);

  const colors = ['#3b82f6','#10b981','#ef4444','#f59e0b','#8b5cf6','#06b6d4','#84cc16','#f97316'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedDataByYear).length < 2 ? (
          <p className="text-muted-foreground">
            Odaberite najmanje 2 godine za poređenje iz godine u godinu.
          </p>
        ) : (
          <div className="w-full overflow-x-auto">
            {/* Grafikon wrapper */}
            <div className="min-w-[700px] h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
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
                        metric ? `YoY Delta: ${formatCurrency(metric.delta)}, ${metric.percentChange.toFixed(2)}%` : '',
                      ].filter(Boolean);
                    }}
                  />

                  {/* Horizontal scrollable legenda za mobilne */}
                  <Legend 
                    wrapperStyle={{
                      bottom: -5,
                      left: 0,
                      right: 0,
                      overflowX: 'auto',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'flex-start',
                      fontSize: 12,
                    }}
                    iconType="circle"
                  />

                  {selectedIndicators.flatMap((indicator, index) =>
                    Object.keys(groupedDataByYear).map((year, yearIndex) => {
                      const cleanIndicatorName = `${indicator.replace(/ Euros$/, '').replace(/^[ =]/, '')} (${year})`;
                      return (
                        <Line
                          key={`${indicator}-${year}`}
                          type="monotone"
                          dataKey={cleanIndicatorName}
                          stroke={colors[(index * Object.keys(groupedDataByYear).length + yearIndex) % colors.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      );
                    })
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
