'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label"; // Add this import
import { FinancialData } from "@/types/financial";
import { createAIClient } from "@/lib/ai";
import { Bot, MessageSquare, Sparkles } from "lucide-react";

interface AIInsightsProps {
  data: FinancialData;
  selectedIndicators: string[];
}

export function AIInsights({ data, selectedIndicators }: AIInsightsProps) {
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<string[]>([]);

  const aiClient = createAIClient();

  const generateAnalysis = async (customQuestion?: string) => {
    if (!aiClient) {
      setAnalysis("AI analza nije dosptupna.");
      return;
    }

    if (selectedIndicators.length === 0) {
      setAnalysis("Molimo odaberite neke finansijske indikatore za analizu.");
      return;
    }

    setLoading(true);
    try {
      const relevantData: FinancialData = {};
      selectedIndicators.forEach(indicator => {
        relevantData[indicator] = data[indicator] || {};
      });

      const dataStr = JSON.stringify(relevantData, null, 2);
      const result = await aiClient.analyzeFinancialData({
        financialData: dataStr,
        question: customQuestion || question || "Pružite sveobuhvatnu analizu ovih finansijskih podataka sa praktičnim uvidima",
        context: "Ovo je analiza finansijskog kontrolnog panela vlade."
      });

      setAnalysis(result);
      setLastAnalyzed([...selectedIndicators]);
    } catch (error) {
      console.error('AI analiza error:', error);
      setAnalysis("Nije uspelo generisanje AI analize. Molimo pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const quickAnalysisPrompts = [
    "Koji su glavni trendovi i obrasci u ovim podacima?",
    "Identifikujte potencijalne rizike i oblasti zabrinutosti",
    "Koje prilike za poboljšanje vidite?",
    "Uporedite obrasce prihoda i rashoda",
    "Analizirajte održivost trenutnih finansijskih trendova"
  ];

  const hasDataChanged = JSON.stringify(selectedIndicators) !== JSON.stringify(lastAnalyzed);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Finansijska Analiza
            <Badge variant="outline" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by DeepSeek
            </Badge>
          </CardTitle>
          <CardDescription>
          Dobijte uvide i analizu vaših finansijskih podataka zasnovane na umjetnoj inteligenciji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!aiClient && (
            <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Da biste omogućili AI analizu, dodajte svoj OpenRouter API ključ kao <code>NEXT_PUBLIC_OPENROUTER_API_KEY</code> u svoje varijable okruženja.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="question">Postavite specifično pitanje (opcionalno)</Label>
            <Textarea
              id="question"
              placeholder="Npr., Koji su glavni rizici u našim trenutnim obrascima trošenja?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Brze opcije analize:</Label>
            <div className="flex flex-wrap gap-2">
              {quickAnalysisPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => generateAnalysis(prompt)}
                  disabled={!aiClient || loading || selectedIndicators.length === 0}
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => generateAnalysis()}
              disabled={!aiClient || loading || selectedIndicators.length === 0}
              className="flex-1"
            >
              {loading ? "Analiziram..." : "Generiši AI analizu"}
            </Button>
            
            {hasDataChanged && analysis && (
              <Button 
                variant="outline"
                onClick={() => generateAnalysis()}
                disabled={loading}
              >
                Update Analysis
              </Button>
            )}
          </div>

          {selectedIndicators.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Odaberite finansijske indikatore iznad da omogućite AI analizu.
            </p>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Rezultati analize
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {analysis}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}