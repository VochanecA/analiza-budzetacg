interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AnalysisRequest {
  financialData: string;
  question?: string;
  context?: string;
}

export class FinancialAI {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeFinancialData({
    financialData,
    question = "Act as financial expert for state budget, in IMF and Wolrd Banks, with experince in Goverment of EU country. Provide a comprehensive analysis of this financial data",
    context = ""
  }: AnalysisRequest): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          'X-Title': 'Financial Dashboard AI Analysis',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3.1:free', // Updated model name
          messages: [
            {
              role: 'system',
             content: `Vi ste višestruki finansijski analitičar specijalizovan za državne finansije i ekonomske pokazivače. 
Molim vas da pružite jasne, praktične uvide koje mogu razumjeti i oni bez finansijskog znanja. 
Fokusirajte se na trendove, rizike, prilike i praktične implikacije. 
Koristite jednostavan jezik uz održavanje analitičke dubine.
Uvijek strukturirajte odgovor sa jasnim odjeljcima i nabrajanjem radi bolje čitljivosti.Što kraće, i što razumljivije za obične korisnike, koji ništa ne znaju o finansijama.Odgovor daj na crnogorskom jeziku.`
            },
            {
              role: 'user',
              content: `${context}\n\nQuestion: ${question}\n\nFinancial Data:\n${financialData}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const result: OpenRouterResponse = await response.json();
      return result.choices[0]?.message?.content || 'No analysis available';
    } catch (error) {
      console.error('AI Analysis error:', error);
      return 'AI analysis is temporarily unavailable. Please check your API configuration and try again.';
    }
  }

  async generateForecastInsights(
    indicator: string,
    historicalValues: number[],
    monteCarloResults: any
  ): Promise<string> {
    const dataStr = JSON.stringify({
      indicator,
      historicalValues,
      monteCarloResults,
    }, null, 2);

    return this.analyzeFinancialData({
      financialData: dataStr,
      question: "Based on this Monte Carlo simulation and historical data, what are the key insights and risks for this financial indicator?",
      context: "This is forecast analysis using Monte Carlo simulation."
    });
  }
}

export function createAIClient(): FinancialAI | null {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenRouter API key not configured. AI features will be disabled.');
    return null;
  }
  
  return new FinancialAI(apiKey);
}