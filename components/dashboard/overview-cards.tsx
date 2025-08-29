'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Bot, Sparkles, X } from "lucide-react";
import { FinancialData } from "@/types/financial";
import { calculateStats, formatCurrency } from "@/lib/financial-utils";
import { createAIClient } from "@/lib/ai";
import { Badge } from "@/components/ui/badge";

interface OverviewCardsProps {
  data: FinancialData;
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [lastDataHash, setLastDataHash] = useState("");

  const aiClient = createAIClient();

  // Funkcija za generisanje hash-a od podataka za praćenje promjena
  const generateDataHash = (data: FinancialData) => {
    return JSON.stringify({
      revenueKeys: Object.keys(data["Total Revenues, Euros"] || {}),
      revenueValues: Object.values(data["Total Revenues, Euros"] || {})
    });
  };

  // Efekt za praćenje promjena u podacima
  useEffect(() => {
    const currentHash = generateDataHash(data);
    
    if (lastDataHash && currentHash !== lastDataHash && showAnalysis) {
      // Podaci su se promijenili - resetuj analizu
      setAnalysis("");
      setShowAnalysis(false);
    }
    
    setLastDataHash(currentHash);
  }, [data, lastDataHash, showAnalysis]);

  const getIndicatorStats = (indicator: string) => {
    const values = Object.values(data[indicator] || {});
    return calculateStats(values);
  };

  const generateOverviewAnalysis = async () => {
    if (!aiClient) {
      setAnalysis("AI analiza nije dostupna. Molimo konfigurišite OpenRouter API ključ.");
      setShowAnalysis(true);
      return;
    }

    setLoading(true);
    
    try {
      // Prepare overview data for analysis
      const overviewData = {
        revenue: getIndicatorStats("Total Revenues, Euros"),
        expenditure: getIndicatorStats("Total Expenditures, Euros"),
        tax: getIndicatorStats("Taxes, Euros"),
        surplus: calculateSurplus(),
        periods: Object.keys(data["Total Revenues, Euros"] || {}).length,
        totalIndicators: Object.keys(data).length
      };

      const dataStr = JSON.stringify(overviewData, null, 2);
      
      const result = await aiClient.analyzeFinancialData({
        financialData: dataStr,
        question: "Pružite sveobuhvatnu analizu ovih finansijskih overview metrika. Fokusirajte se na: obrasce prihoda u odnosu na rashode, fiskalno zdravlje, performanse poreza i ukupnu finansijsku održivost. Istaknite ključne trendove, rizike i mogućnosti.",
        context: "Ovo je analiza overview finansijskih podataka vlade iz dashboarda."
      });

      setAnalysis(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error('AI analysis error:', error);
      setAnalysis("Neuspjelo generisanje AI analize. Molimo pokušajte ponovo.");
      setShowAnalysis(true);
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis("");
    setShowAnalysis(false);
  };

  // Remove the leading spaces from indicator names
  const revenueStats = getIndicatorStats("Total Revenues, Euros");
  const expenditureStats = getIndicatorStats("Total Expenditures, Euros");
  const taxStats = getIndicatorStats("Taxes, Euros");
  
  // Calculate surplus/deficit since it doesn't exist in the data
  const calculateSurplus = () => {
    const revenueValues = Object.values(data["Total Revenues, Euros"] || {});
    const expenditureValues = Object.values(data["Total Expenditures, Euros"] || {});
    
    if (revenueValues.length === 0 || expenditureValues.length === 0) {
      return { total: 0, growthRate: 0 };
    }
    
    // Calculate surplus for each period and then stats
    const surplusValues = revenueValues.map((revenue, index) => 
      revenue - (expenditureValues[index] || 0)
    );
    
    return calculateStats(surplusValues);
  };

  const surplusStats = calculateSurplus();

  const cards = [
    {
      title: "Ukupni Prihodi",
      value: formatCurrency(revenueStats.total),
      change: `${revenueStats.growthRate.toFixed(1)}%`,
      trend: revenueStats.growthRate >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Ukupni Rashodi",
      value: formatCurrency(expenditureStats.total),
      change: `${expenditureStats.growthRate.toFixed(1)}%`,
      trend: expenditureStats.growthRate >= 0 ? "up" : "down",
      icon: PieChart,
      color: "text-red-600",
    },
    {
      title: "Neto Bilans",
      value: formatCurrency(surplusStats.total),
      change: `${surplusStats.growthRate.toFixed(1)}%`,
      trend: surplusStats.growthRate >= 0 ? "up" : "down",
      icon: surplusStats.total >= 0 ? TrendingUp : TrendingDown,
      color: surplusStats.total >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Poreski Prihodi",
      value: formatCurrency(taxStats.total),
      change: `${taxStats.growthRate.toFixed(1)}%`,
      trend: taxStats.growthRate >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={`mr-1 h-3 w-3 ${card.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                  <span className={card.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {card.change}
                  </span>
                  <span className="ml-1">u odnosu na prethodni period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Analysis Button */}
      <div className="flex justify-center">
        <Button 
          onClick={generateOverviewAnalysis}
          disabled={loading || !aiClient}
          className="flex items-center gap-2"
          variant="outline"
        >
          {loading ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              Analiziram...
            </>
          ) : (
            <>
              <Bot className="h-4 w-4" />
              Napravi AI Analizu
            </>
          )}
        </Button>
      </div>

      {showAnalysis && (
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              Finansijska Analiza
              <Badge variant="outline" className="ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by DeepSeek
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAnalysis}
              className="h-8 w-8 p-0"
              title="Obriši analizu"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {analysis}
              </pre>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Analiza bazirana na finansijskim metrikama
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={generateOverviewAnalysis}
                disabled={loading}
              >
                {loading ? "Ažuriram..." : "Osveži Analizu"}
              </Button>
            </div>
            {!aiClient && (
              <p className="text-sm text-amber-600 mt-4">
                Napomena: AI analiza zahtijeva konfiguraciju OpenRouter API ključa.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}