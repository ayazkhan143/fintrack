# FinTrack — Personal Finance Manager

A production-ready personal finance app built with Expo SDK 52, TypeScript strict mode, and offline-first SQLite storage.

## Features

- **Multi-account tracking** — checking, savings, credit, cash, investment
- **Transaction management** — income, expense, transfers with full filtering & search
- **Smart budgets** — weekly/monthly/yearly budgets with progress tracking and alerts
- **Analytics dashboard** — bar charts, category breakdowns, period summaries
- **Offline-first** — everything stored locally in SQLite (expo-sqlite v15)
- **Biometric lock** — Face ID / Touch ID / fingerprint with grace period
- **Dark mode** — full system/light/dark theme support
- **Push notifications** — budget alerts and recurring transaction reminders
- **Recurring transactions** — schedule transactions that repeat
- **Multi-currency** — USD, EUR, GBP, PKR, SAR, AED, CAD, AUD

## Tech Stack

| Category | Library |
|----------|---------|
| Framework | Expo SDK 52, Expo Router v4 |
| Language | TypeScript (strict) |
| Database | expo-sqlite v15 (WAL mode) |
| State | Zustand v5 |
| Server state | TanStack Query v5 |
| Forms | react-hook-form + Zod |
| Lists | @shopify/flash-list |
| Charts | react-native-chart-kit |
| Auth | expo-local-authentication |
| Notifications | expo-notifications |
| Haptics | expo-haptics |

## Project Structure

```
fintrack/
├── app/
│   ├── _layout.tsx              # Root layout + providers + bootstrap
│   ├── index.tsx                # Redirect gate (onboarding → lock → tabs)
│   ├── (auth)/
│   │   ├── onboarding.tsx       # 4-slide onboarding
│   │   └── lock.tsx             # Biometric lock screen
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar (home, transactions, +, budgets, analytics)
│   │   ├── index.tsx            # Home dashboard
│   │   ├── transactions.tsx     # Transaction list with search + filter
│   │   ├── budgets.tsx          # Active budgets with progress
│   │   └── analytics.tsx        # Charts + category breakdown
│   ├── modals/
│   │   ├── add-transaction.tsx  # Full transaction form
│   │   ├── transaction-detail.tsx
│   │   ├── add-account.tsx
│   │   └── add-budget.tsx
│   └── settings/
│       └── index.tsx
├── src/
│   ├── types/         # All TypeScript types and interfaces
│   ├── constants/     # Colors, currencies, system categories
│   ├── db/            # SQLite layer (accounts, transactions, budgets, categories, settings)
│   ├── stores/        # Zustand stores (settings, theme)
│   ├── hooks/         # TanStack Query hooks (accounts, transactions, budgets, categories)
│   ├── utils/         # currency, date, haptics, id generation
│   ├── services/      # biometric, notifications
│   └── components/    # Reusable UI components
```

## Getting Started

```bash
npm install
npx expo start
```

## EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas init

# Build for development
eas build --profile development --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Assets

Replace placeholder assets in `assets/images/` with your own:
- `icon.png` — 1024×1024 app icon
- `splash-icon.png` — splash screen image
- `adaptive-icon.png` — Android adaptive icon foreground
- `notification-icon.png` — Android notification icon (96×96, white on transparent)
