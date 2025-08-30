'use client';
import dynamic from 'next/dynamic';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Bot, Sparkles, X } from "lucide-react";
import { FinancialData } from "@/types/financial";
import { calculateStats, formatCurrency } from "@/lib/financial-utils";
import { createAIClient } from "@/lib/ai";
import { Badge } from "@/components/ui/badge";

import {  Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

// PDF stilovi
const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  title: { fontSize: 18, marginBottom: 8, color: '#1e40af', fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginBottom: 6, color: '#2563eb', fontWeight: 'bold' },
  text: { fontSize: 12, marginBottom: 4 },
  highlight: { fontWeight: 'bold', color: '#10b981' },
  list: { marginLeft: 12, marginBottom: 4 }
});

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);
// PDF komponenta
const AnalysisPDF = ({ analysis }: { analysis: string }) => {
  const lines = analysis.split('\n');
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) return <Text key={idx} style={pdfStyles.subtitle}>{line.replace('### ', '')}</Text>;
          if (line.startsWith('## ')) return <Text key={idx} style={pdfStyles.title}>{line.replace('## ', '')}</Text>;
          if (line.startsWith('**') && line.endsWith('**')) return <Text key={idx} style={pdfStyles.highlight}>{line.replace(/\*\*/g,'')}</Text>;
          if (line.startsWith('•')) return <Text key={idx} style={pdfStyles.list}>• {line.replace('•','').trim()}</Text>;
          if (line.match(/^\d+\./)) return <Text key={idx} style={pdfStyles.list}>{line.trim()}</Text>;
          if (line.trim() === '') return <Text key={idx}>&nbsp;</Text>;
          return <Text key={idx} style={pdfStyles.text}>{line}</Text>;
        })}
      </Page>
    </Document>
  );
};

interface OverviewCardsProps { data: FinancialData; }

export function OverviewCards({ data }: OverviewCardsProps) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [lastDataHash, setLastDataHash] = useState("");

  const aiClient = createAIClient();

  const generateDataHash = (data: FinancialData) => {
    return JSON.stringify({
      revenueKeys: Object.keys(data["Ukupni Prihodi, Euro"] || data["Total Revenues, Euros"] || {}),
      revenueValues: Object.values(data["Ukupni Prihodi, Euro"] || data["Total Revenues, Euros"] || {})
    });
  };

  useEffect(() => {
    const currentHash = generateDataHash(data);
    if (lastDataHash && currentHash !== lastDataHash && showAnalysis) {
      setAnalysis(""); setShowAnalysis(false);
    }
    setLastDataHash(currentHash);
  }, [data, lastDataHash, showAnalysis]);

  const getIndicatorStats = (indicator: string) => {
    const values = Object.values(data[indicator] || {});
    return calculateStats(values);
  };

  const calculateSurplus = () => {
    const revenueIndicator = data["Ukupni Prihodi, Euro"] ? "Ukupni Prihodi, Euro" : "Total Revenues, Euros";
    const expenditureIndicator = data["Ukupni Rashodi, Euro"] ? "Ukupni Rashodi, Euro" : "Total Expenditures, Euros";
    const revenueValues = Object.values(data[revenueIndicator] || {});
    const expenditureValues = Object.values(data[expenditureIndicator] || {});
    if (!revenueValues.length || !expenditureValues.length) return { total: 0, growthRate: 0 };
    const surplusValues = revenueValues.map((r, i) => r - (expenditureValues[i] || 0));
    return calculateStats(surplusValues);
  };

  const generateOverviewAnalysis = async () => {
    if (!aiClient) { setAnalysis("AI analiza nije dostupna."); setShowAnalysis(true); return; }
    setLoading(true);
    try {
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
        indicatorNames: Object.keys(data).slice(0, 10)
      };
      const dataStr = JSON.stringify(overviewData, null, 2);
      const result = await aiClient.analyzeFinancialData({ financialData: dataStr, question: '...', context: '...' });
      setAnalysis(result); setShowAnalysis(true);
    } catch (error) {
      console.error(error); setAnalysis("Neuspjelo generisanje AI analize."); setShowAnalysis(true);
    } finally { setLoading(false); }
  };

  const clearAnalysis = () => { setAnalysis(""); setShowAnalysis(false); };

  const revenueIndicator = data["Ukupni Prihodi, Euro"] ? "Ukupni Prihodi, Euro" : "Total Revenues, Euros";
  const expenditureIndicator = data["Ukupni Rashodi, Euro"] ? "Ukupni Rashodi, Euro" : "Total Expenditures, Euros";
  const taxIndicator = data["Porezi, Euro"] ? "Porezi, Euro" : "Taxes, Euros";
  const revenueStats = getIndicatorStats(revenueIndicator);
  const expenditureStats = getIndicatorStats(expenditureIndicator);
  const taxStats = getIndicatorStats(taxIndicator);
  const surplusStats = calculateSurplus();

  const cards = [
    { title: "Ukupni Prihodi", value: formatCurrency(revenueStats.total), change: `${revenueStats.growthRate.toFixed(1)}%`, trend: revenueStats.growthRate >= 0 ? "up" : "down", icon: DollarSign, color: "text-green-600" },
    { title: "Ukupni Rashodi", value: formatCurrency(expenditureStats.total), change: `${expenditureStats.growthRate.toFixed(1)}%`, trend: expenditureStats.growthRate >= 0 ? "up" : "down", icon: PieChart, color: "text-red-600" },
    { title: "Neto Bilans", value: formatCurrency(surplusStats.total), change: `${surplusStats.growthRate.toFixed(1)}%`, trend: surplusStats.growthRate >= 0 ? "up" : "down", icon: surplusStats.total >= 0 ? TrendingUp : TrendingDown, color: surplusStats.total >= 0 ? "text-green-600" : "text-red-600" },
    { title: "Poreski Prihodi", value: formatCurrency(taxStats.total), change: `${taxStats.growthRate.toFixed(1)}%`, trend: taxStats.growthRate >= 0 ? "up" : "down", icon: TrendingUp, color: "text-blue-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <Card key={idx} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={`mr-1 h-3 w-3 ${card.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                  <span className={card.trend === "up" ? "text-green-600" : "text-red-600"}>{card.change}</span>
                  <span className="ml-1">u odnosu na prethodni period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button onClick={generateOverviewAnalysis} disabled={loading || !aiClient} className="flex items-center gap-2" variant="outline">
          {loading ? <><Sparkles className="h-4 w-4 animate-pulse"/> Analiziram...</> : <><Bot className="h-4 w-4"/> Napravi AI Analizu</>}
        </Button>
      </div>

      {showAnalysis && (
        <Card className="mt-4 bg-white dark:bg-slate-800 shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-semibold">
              <Bot className="h-5 w-5 text-blue-600" />
              Finansijska Analiza
              <Badge variant="outline" className="ml-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3"/>
                Pokretano sa DeepSeek AI
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearAnalysis} className="h-8 w-8 p-0" title="Obriši analizu">
              <X className="h-4 w-4"/>
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert break-words">
              {analysis.split('\n').map((line, idx) => {
                if (line.startsWith('### ')) return <h3 key={idx} className="text-indigo-600 mt-4">{line.replace('### ', '')}</h3>;
                if (line.startsWith('## ')) return <h2 key={idx} className="text-blue-600 mt-6">{line.replace('## ', '')}</h2>;
                if (line.startsWith('**') && line.endsWith('**')) return <strong key={idx} className="text-green-600">{line.replace(/\*\*/g,'')}</strong>;
                if (line.startsWith('1.') || line.startsWith('2.') || line.match(/^\d+\./)) return <li key={idx} className="ml-4 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>;
                if (line.startsWith('•')) return <li key={idx} className="ml-4 list-disc">{line.replace('•','')}</li>;
                if (line.trim() === '') return <br key={idx} />;
                return <p key={idx}>{line}</p>;
              })}
            </div>

            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-2">
              <p className="text-sm text-muted-foreground">Analiza bazirana na finansijskim metrikama</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generateOverviewAnalysis} disabled={loading}>
                  {loading ? "Ažuriram..." : "Osvježite Analizu"}
                </Button>
                <PDFDownloadLink
                  document={<AnalysisPDF analysis={analysis} />}
                  fileName={`Finansijska_Analiza_${new Date().toISOString().split('T')[0]}.pdf`}
                  style={{ textDecoration:"none", padding:"8px 12px", color:"#2563eb", border:"1px solid #2563eb", borderRadius:"6px", fontSize:"0.875rem", fontWeight:"500", display:"inline-flex", alignItems:"center", justifyContent:"center" }}
                >
                  {({ loading }) => (loading ? "Priprema PDF..." : "Skini kao PDF")}
                </PDFDownloadLink>
              </div>
            </div>

            {!aiClient && <p className="text-sm text-amber-600 mt-4">Napomena: AI analiza zahtijeva konfiguraciju OpenRouter API ključa.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
