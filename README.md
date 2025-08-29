# Financial Analytics Dashboard

A comprehensive financial analysis platform built with Next.js 14+ featuring advanced analytics, Monte Carlo simulations, and AI-powered insights.

## Features

### 📊 Core Analytics
- **Time Series Visualization**: Interactive charts showing financial trends over time
- **Comparative Analysis**: Side-by-side comparison of different financial indicators
- **Summary Statistics**: Totals, averages, growth rates, and standard deviations
- **Dynamic Filtering**: Filter by date ranges and select specific indicators

### 🎲 Risk Analysis
- **Monte Carlo Simulation**: Probabilistic forecasting based on historical patterns
- **Risk Assessment**: 5th to 95th percentile outcome ranges
- **Scenario Planning**: Conservative, expected, and optimistic forecasts

### 🤖 AI-Powered Insights
- **Natural Language Analysis**: Ask questions about your financial data
- **Automated Insights**: AI identifies trends, risks, and opportunities
- **DeepSeek Integration**: Powered by advanced language models via OpenRouter

### 📱 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Intuitive Interface**: Designed for both financial and non-financial users
- **Real-time Updates**: Dynamic charts and statistics update as you explore

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Add your OpenRouter API key to `.env.local`:
```env
NEXT_PUBLIC_OPENROUTER_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### AI Analysis Setup
To enable AI-powered financial analysis:

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file as `NEXT_PUBLIC_OPENROUTER_API_KEY`

### Data Format
The application expects financial data in `public/data.json` with this structure:

```json
{
  "Indicator Name": {
    "2025-01": 123456.78,
    "2025-02": 234567.89,
    ...
  }
}
```

## Technology Stack

- **Frontend**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for data visualization
- **AI Integration**: OpenRouter with DeepSeek models
- **Type Safety**: TypeScript throughout
- **Code Quality**: ESLint + Prettier

## Project Structure

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main dashboard page
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/              # Reusable UI components (shadcn/ui)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── types/               # TypeScript type definitions
├── public/              # Static assets including data.json
└── README.md
```

## Key Components

### Dashboard Components
- `OverviewCards`: Key performance indicators at a glance
- `TimeSeriesChart`: Line charts for trend analysis
- `ComparativeAnalysis`: Bar and pie charts for comparative insights
- `StatisticsPanel`: Detailed statistical summaries
- `MonteCarloSimulation`: Risk analysis and forecasting
- `AIInsights`: AI-powered financial analysis

### Utility Libraries
- `financial-utils.ts`: Core financial calculations and utilities
- `ai.ts`: OpenRouter integration for AI analysis
- `use-financial-data.ts`: React hook for data management

## Deployment

This application is optimized for deployment on Vercel:

```bash
npm run build
```

The application will be built as a static export, ready for deployment to any static hosting provider.

## Contributing

1. Ensure all code passes ESLint checks
2. Follow the existing code style and patterns
3. Add TypeScript types for new features
4. Test components thoroughly before submitting

## License

MIT License - see LICENSE file for details.