import { NextRequest, NextResponse } from 'next/server';
import { createAIClient } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const aiClient = createAIClient();
    
    if (!aiClient) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const { financialData, question, context } = await request.json();

    const analysis = await aiClient.analyzeFinancialData({
      financialData,
      question,
      context,
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}