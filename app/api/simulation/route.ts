import { NextRequest, NextResponse } from 'next/server';
import { runMonteCarloSimulation } from '@/lib/financial-utils';

export async function POST(request: NextRequest) {
  try {
    const { values, periods = 12, simulations = 10000 } = await request.json();

    if (!Array.isArray(values) || values.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 historical values for simulation' },
        { status: 400 }
      );
    }

    const result = runMonteCarloSimulation(values, periods, simulations);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Simulation API error:', error);
    return NextResponse.json(
      { error: 'Failed to run simulation' },
      { status: 500 }
    );
  }
}