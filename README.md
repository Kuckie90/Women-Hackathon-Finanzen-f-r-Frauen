🌸 About Angelegt
Women face systemic hurdles across their financial and retirement lifecycles: the Gender Pay Gap, Gender Care Gap, and the resulting Gender Pension Gap (often exceeding a 50% gap compared to statutory pensions for men). At the same time, traditional retail financial products remain opaque, commission-driven, or burdened by hidden management fees.
Angelegt bridges this gap: it offers an unbiased, transparent, and behaviorally grounded entry point into personal financial planning. Zero sales agenda, fully accessible, and backed by proven financial research—aligned with Gerd Kommer's World Portfolio Principles, Stiftung Warentest (Finanztip) standards, and behavioral economics (loss aversion, mental accounting).
🧭 The 4 Core Modules
The application consists of four interconnected modules that can be explored individually or as a unified journey:
1. 🎛️ Asset & Pot Analysis (Three-Pot Model)
Individual Risk Profiling: Guided questions covering investment horizon, emotional loss tolerance, income stability, and planned career breaks (parental leave, care work, sabbaticals).
Evidence-Based Target Allocation: Calculates the ideal distribution across Safety Pot (Sicherheit), Growth Pot (Wachstum), and Future / Opportunity Pot (Spielgeld).
Emergency Fund Calculator: Dynamic liquidity buffer calculation tailored to marital status, notice periods, and personal security preferences.
Savings Rate Allocator: Optimal split for monthly contributions and lump-sum investments, including rebalancing recommendations.
2. ⏳ Pension Gap & Life Goals Calculator
Net Pension Projection & Inflation: Realistic forecast of statutory pension entitlements adjusted for inflation and progressive taxation.
Career Biography Modeling: Seamlessly factor in part-time phases, caregiving intervals, and re-entry stages.
Target Capital & Monthly Shortfall: Precise calculation of required retirement capital and the monthly savings rate needed to achieve financial independence.
3. ⚖️ Household Budgeting (50 / 30 / 20 Rule)
Rapid overview of fixed living expenses (housing, utilities, insurance), flexible lifestyle costs, and savings capacity.
Instant determination of true net monthly investable cash flow.
4. 📈 Compound Interest & Savings Plan Simulator
Interactive projection of long-term wealth accumulation with real-time sliders for return rates, inflation adjustments, and investment horizons.
Visual comparison of best-case, baseline, and conservative stress-test scenarios.
🏺 The Three-Pot Allocation Model
code
Code
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│     1. SAFETY POT       │      2. GROWTH POT      │  3. FUTURE / EXPERIMENT │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Overnight deposit /   │ • Global equity ETFs    │ • Individual stocks     │
│   call money (Tagesgeld)│   (MSCI World, All-     │ • Crypto / Megatrends   │
│ • Fixed-term / cash eq. │   Country World, ACWI)  │ • Physical commodities  │
│ • AAA/AA govt bonds     │ • Compounding returns   │ • Strict max 5–10% cap  │
│ • Emergency protection  │ • 10–15+ year horizon   │ • Exploration buffer    │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
Pot 1 (Safety): Shields against panic selling during market drawdowns. Fully covers 3–6 months of essential living expenses.
Pot 2 (Growth): Outpaces inflation through broad, ultra-low-cost diversification across thousands of global companies.
Pot 3 (Future / Opportunity): A controlled playground for thematic trends, tech bets, or personal interests without jeopardizing long-term retirement security.
🔍 Integrated Portfolio & Statement Audit
With the built-in PDF & Text Analyzer, users can upload brokerage statements or paste holdings:
Automated ISIN Detection: Matched against a verified database of common broad-market ETFs, active mutual funds, and asset classes.
Expense Ratio (TER) Inspection: Flags high-cost legacy products and costly bank-sold funds (>1.5% TER).
Cluster & Correlation Alerts: Visual warnings for excessive US tech concentration, niche sector bets, or unhedged risk exposure.
Optional AI Enhancement: Server-side document extraction powered by the Gemini API, backed by resilient client-side regex and offline parsers.
💻 Tech Stack
Frontend: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion)
Charts & Data Visualization: Recharts (compound interest curves, pension gap projections, allocation donuts)
Icons: Lucide React
PDF Extraction: pdfjs-dist for browser-based document parsing
Backend Server: Express (Node.js 22), tsx, esbuild
AI Integration: Google GenAI SDK (@google/genai)
🚀 Quick Start
Prerequisites
Node.js (version 20 or higher recommended)
npm
1. Clone the repository
code
Bash
git clone https://github.com/Kuckie90/Women-Hackathon-Finanzen-f-r-Frauen.git
cd Women-Hackathon-Finanzen-f-r-Frauen
2. Install dependencies
code
Bash
npm install
3. Configure environment variables (optional)
Copy the .env.example file to .env:
code
Bash
cp .env.example .env
Optionally add your Gemini API key (for AI-powered portfolio statement extraction; all core features and the offline parser work out of the box without an API key):
code
Env
GEMINI_API_KEY=your_gemini_api_key_here
4. Run development server
code
Bash
npm run dev
Open http://localhost:3000 in your browser.
5. Production build
code
Bash
npm run build
npm start
🔒 Privacy & Security
Client-Side First: Financial amounts, inputs, and emergency fund numbers are processed locally in transient browser memory.
Zero Ad Tracking: No selling, sharing, or tracking of personal financial data with third parties.
No Affiliate Sales: Angelegt is purely an educational tool and does not distribute commission-based financial products.
