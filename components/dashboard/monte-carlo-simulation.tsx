'use client';

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FinancialData } from "@/types/financial";
import { runMonteCarloSimulation, formatCurrency } from "@/lib/financial-utils";
import { Calculator, TrendingUp, AlertTriangle, Bot } from "lucide-react";
import { createAIClient } from "@/lib/ai";

interface MonteCarloSimulationProps {
  data: FinancialData;
  availableIndicators: string[];
}

export function MonteCarloSimulation({ data, availableIndicators }: MonteCarloSimulationProps) {
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [periods, setPeriods] = useState<number>(12);
  const [simulations, setSimulations] = useState<number>(10000);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // AI states
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Predefinisano pitanje (ne prikazuje se korisniku)
  const defaultQuestion =
    "Analiziraj rezultate Monte Karlo simulacije prikazane u grafikonu. Fokusiraj se na očekivanu vrijednost, rizike (donje percentile) i prilike (gornje percentile). Objasni jednostavno i jasno za obične korisnike.";

  const runSimulation = async () => {
    if (!selectedIndicator) return;

    setLoading(true);
    try {
      const values = Object.values(data[selectedIndicator] || {});
      if (values.length < 2) {
        throw new Error("Potrebna su najmanje 2 podatka za simulaciju");
      }

      const result = runMonteCarloSimulation(values, periods, simulations);
      setResults(result);
    } catch (error) {
      console.error("Monte Carlo simulation error:", error);
    } finally {
      setLoading(false);
    }
  };

  async function handleAIAnalysis() {
    if (!results) return;

    const client = createAIClient();
    if (!client) {
      setAiResult("AI analiza nije dostupna. Provjerite API ključ.");
      return;
    }

    setAiLoading(true);
    try {
      // ograničimo broj poslatih simulacija na 10
      const limitedSimulations = results.simulations.slice(0, 10);

      const summaryData = {
        mean: results.mean,
        percentile5: results.percentile5,
        percentile25: results.percentile25,
        percentile75: results.percentile75,
        percentile95: results.percentile95,
        min: Math.min(...results.simulations),
        max: Math.max(...results.simulations),
        sampleSimulations: limitedSimulations,
      };

      const result = await client.analyzeFinancialData({
        financialData: JSON.stringify(summaryData, null, 2),
        question: defaultQuestion,
        context: `Ovo su rezultati Monte Carlo simulacije za indikator: ${selectedIndicator}. Periodi: ${periods}, broj simulacija: ${simulations}.`
      });

      setAiResult(result);
    } catch (err) {
      console.error("AI analysis error:", err);
      setAiResult("Greška pri AI analizi. Pokušajte ponovo.");
    } finally {
      setAiLoading(false);
    }
  }

  const distributionData = useMemo(() => {
    if (!results) return [];

    const bins = 50;
    const min = Math.min(...results.simulations);
    const max = Math.max(...results.simulations);
    const binSize = (max - min) / bins;

    const distribution = Array.from({ length: bins }, (_, i) => ({
      value: min + i * binSize,
      frequency: 0,
    }));

    results.simulations.forEach((simulation: number) => {
      const binIndex = Math.min(
        Math.floor((simulation - min) / binSize),
        bins - 1
      );
      distribution[binIndex].frequency++;
    });

    return distribution;
  }, [results]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Monte Carlo analiza rizika
          </CardTitle>
          <CardDescription>
            Simulirajte buduće scenarije na osnovu historijskih obrazaca kako biste procijenili rizik i potencijalne ishode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="indicator">Finansijski indikator</Label>
              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger>
                  <SelectValue placeholder="Odaberite indikator..." />
                </SelectTrigger>
                <SelectContent>
                  {availableIndicators.map((indicator) => (
                    <SelectItem key={indicator} value={indicator}>
                      {indicator.replace(/ Euros$/, "").replace(/^[ =]/, "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periods">Periodi prognoze</Label>
              <Input
                id="periods"
                type="number"
                min={1}
                max={60}
                value={periods}
                onChange={(e) =>
                  setPeriods(parseInt(e.target.value, 10) || 12)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="simulations">Simulacije</Label>
              <Select
                value={simulations.toString()}
                onValueChange={(value) => setSimulations(parseInt(value, 10))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1,000</SelectItem>
                  <SelectItem value="5000">5,000</SelectItem>
                  <SelectItem value="10000">10,000</SelectItem>
                  <SelectItem value="50000">50,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={runSimulation}
            disabled={!selectedIndicator || loading}
            className="w-full md:w-auto"
          >
            {loading
              ? "Izvršavanje simulacije..."
              : "Pokreni Monte Carlo simulaciju"}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <>
          {/* Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Rezultati simulacije</CardTitle>
              <CardDescription>
                Statistički ishodi iz {simulations.toLocaleString()} simulacija tokom {periods} perioda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm font-medium">Očekivana vrednost</span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(results.mean)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span className="text-sm font-medium">Rizik (5%)</span>
                  </div>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(results.percentile5)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded"></div>
                    <span className="text-sm font-medium">Konservativni</span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(results.percentile25)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm font-medium">Optimistički</span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(results.percentile75)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-sm font-medium">Najbolji slučaj (95%)</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(results.percentile95)}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Procena rizika:</strong> Postoji 5% šansa da bi vrednost mogla biti ispod{" "}
                  <span className="font-medium text-red-600">{formatCurrency(results.percentile5)}</span>
                  {" "}i 5% šansa da bi mogla premašiti{" "}
                  <span className="font-medium text-green-600">{formatCurrency(results.percentile95)}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Verovatnoća distribucije</CardTitle>
              <CardDescription>
                Frekventna distribucija ishoda simulacije
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="value"
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name) => [value, "Frequency"]}
                      labelFormatter={(value) =>
                        `Value: ${formatCurrency(value)}`
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="frequency"
                      stroke="#3b82f6"
                      fill="url(#colorGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI analiza Monte Carlo rezultata
              </CardTitle>
              <CardDescription>
                Automatska interpretacija rezultata simulacije
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleAIAnalysis} disabled={aiLoading} className="mb-4">
                {aiLoading ? "Analiziranje..." : "Napravi AI Analizu"}
              </Button>
              {aiResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg whitespace-pre-line text-sm">
                  {aiResult}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
