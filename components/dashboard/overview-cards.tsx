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
      revenueKeys: Object.keys(data["Ukupni Prihodi, Euro"] || data["Total Revenues, Euros"] || {}),
      revenueValues: Object.values(data["Ukupni Prihodi, Euro"] || data["Total Revenues, Euros"] || {})
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
      // Prepare overview data for analysis - support both English and Serbian indicator names
      const revenueIndicator = data["Ukupni Prihodi, Euro"] ? "Ukupni Prihodi, Euro" : "Total Revenues, Euros";
      const expenditureIndicator = data["Ukupni Rashodi, Euro"] ? "Ukupni Rashodi, Euro" : "Total Expenditures, Euros";
      const taxIndicator = data["Porezi, Euro"] ? "Porezi, Euro" : "Taxes, Euros";

      const overviewData = {
        revenue: getIndicatorStats(revenueIndicator),
        expenditure: getIndicatorStats(expenditureIndicator),
        tax: getIndicatorStats(taxIndicator),
        surplus: calculateSurplus(),
        periods: Object.keys(data[revenueIndicator] || {}).length,
        totalIndicators: Object.keys(data).length,
        availableMonths: Object.keys(data[revenueIndicator] || {}).sort(),
        indicatorNames: Object.keys(data).slice(0, 10) // First 10 for context
      };

      const dataStr = JSON.stringify(overviewData, null, 2);
      
      const result = await aiClient.analyzeFinancialData({
        financialData: dataStr,
        question: `
**ANALIZA REALIZACIJE DRŽAVNOG BUDŽETA CRNE GORE**

Kao ekspert za javne finansije i budžetsku politiku, pružite detaljnu analizu realizacije državnog budžeta sa fokusom na:

## OSNOVNE METRIKE I PERFORMANSE
• **Budžetski bilans**: Analizirajte suficit/deficit i primarni bilans
• **Stopa realizacije**: Poredite planirane vs. ostvarene prihode i rashode
• **Fiskalna disciplina**: Ocenite poštovanje budžetskih ograničenja

## ANALIZA PRIHODA
• **Poreska efikasnost**: Performanse PDV-a, poreza na dobit, akciza i drugih poreza
• **Diverzifikacija prihoda**: Zavisnost od pojedinih poreskih kategorija
• **Sezonalnost**: Identifikujte mesečne i kvartalne obrasce naplate
• **Poreska elastičnost**: Kako porezi reaguju na ekonomske promene

## ANALIZA RASHODA
• **Struktura rashoda**: Odnos tekućih vs. kapitalnih rashoda
• **Efikasnost trošenja**: Analiza rashoda po kategorijama (plate, usluge, investicije)
• **Socijalni transferi**: Održivost sistema socijalnog osiguranja
• **Investicioni kapacitet**: Sposobnost finansiranja kapitalnih projekata

## FISKALNA ODRŽIVOST
• **Dugoročna održivost**: Trendovi koji utiču na buduće fiskalne pozicije
• **Ciklični vs. strukturni bilans**: Razlikujte privremene od trajnih fiskalnih pritisaka
• **Demografski izazovi**: Uticaj starenja stanovništva na javne finansije
• **Dužnička održivost**: Implikacije za buduće potrebe za finansiranjem

## RIZICI I IZAZOVI
• **Makroekonomski rizici**: Osetljivost na ekonomske šokove
• **Institucionalni rizici**: Kvalitet fiskalnih pravila i upravljanja
• **Vanjski faktori**: Uticaj EU integracija, regionalnih trendova
• **Klimatski i pandemijski rizici**: Pripremljenost za vanredne situacije

## PREPORUKE I MOGUĆNOSTI
• **Kratkoročne mere**: Konkretni koraci za poboljšanje fiskalne pozicije
• **Srednjoročne reforme**: Strukturne promene za veću efikasnost
• **Dugoročna strategija**: Vizija održivog fiskalnog okvira
• **Najbolje prakse**: Uporedite sa EU standardima i regionalnim zemljama

## BENCHMARK ANALIZA
• Uporedite sa:
  - EU prosjekom za slične makroekonomske indikatore
  - Maastrichtskim kriterijumima (deficit 3% GDP, dug 60% GDP)
  - Regionalnim zemljama (Srbija, Severna Makedonija, Albanija)
  - Istorijskim performansama Crne Gore

**Ton i format odgovora:**
- Koristite crnogorski/srpski jezik
- Budite precizni i faktografski
- Koristite konkretne brojeve i postotke
- Struktuirajte odgovor sa jasnim sekcijama
- Istaknite ključne nalaze bold formatom
- Završite sa 3-5 konkretnih preporuka

**Fokusirajte se na praktične uvide koji mogu pomoći donosiocima odluka u:**
- Budžetskom planiranju za narednu godinu
- Identifikovanju prostora za fiskalne reforme  
- Upravljanju fiskalnim rizicima
- Poboljšanju transparentnosti i efikasnosti javnih finansija
        `,
        context: `
Ovo je analiza realizacije državnog budžeta Crne Gore na mesečnom nivou. 
Podaci pokrivaju ${overviewData.periods} mesečnih perioda i uključuju osnovne budžetske kategorije.
Analizirajte podatke u kontekstu:
- Evropskih integracija Crne Gore
- Post-COVID ekonomskog oporavka  
- Geopolitičkih izazova u regionu
- Strukturnih reformi javnih finansija
- Demografskih trendova u zemlji

Budžet Crne Gore je denomonovan u eurima, što eliminishe valutni rizik ali ograničava monetarnu politiku.
Fokusirajte se na ključne indikatore: prihode, rashode, neto bilans i poreske performanse.

Dostupni mesečni periodi: ${overviewData.availableMonths.join(', ')}
Ukupno budžetskih kategorija: ${overviewData.totalIndicators}
        `
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

  // Support both English and Serbian indicator names
  const revenueIndicator = data["Ukupni Prihodi, Euro"] ? "Ukupni Prihodi, Euro" : "Total Revenues, Euros";
  const expenditureIndicator = data["Ukupni Rashodi, Euro"] ? "Ukupni Rashodi, Euro" : "Total Expenditures, Euros";
  const taxIndicator = data["Porezi, Euro"] ? "Porezi, Euro" : "Taxes, Euros";

  const revenueStats = getIndicatorStats(revenueIndicator);
  const expenditureStats = getIndicatorStats(expenditureIndicator);
  const taxStats = getIndicatorStats(taxIndicator);
  
  // Calculate surplus/deficit since it doesn't exist in the data
  const calculateSurplus = () => {
    const revenueValues = Object.values(data[revenueIndicator] || {});
    const expenditureValues = Object.values(data[expenditureIndicator] || {});
    
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
                Pokretano sa DeepSeek AI
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