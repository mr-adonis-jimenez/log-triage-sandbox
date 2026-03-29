# Log Triage Sandbox 🔍

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

Interactive environment for experimenting with and analyzing application logs. Test log parsing, filtering, and pattern detection techniques — ideal for developers and SRE teams refining their incident triage workflows without impacting production systems.

## ✨ Features

- **Multi-format Log Parsing** — Support for JSON, plain text, and structured logs
- **Pattern Detection** — Identify errors, warnings, and anomalies automatically
- **Interactive Analysis** — Real-time log filtering and searching
- **Triage Workflows** — Customizable incident categorization
- **No Production Impact** — Safe sandbox environment for testing

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Installation

```bash
git clone https://github.com/mr-adonis-jimenez/log-triage-sandbox.git
cd log-triage-sandbox
npm install
```

### Basic Usage

```bash
# Run the triage script
npm run triage

# Start the application
npm start

# Type check
npm run typecheck

# Lint
npm run lint
```

## 📖 Usage Examples

### Parsing a Log File

```typescript
import { LogParser } from "./src/services/log-parser-service";

const parser = new LogParser();
parser.addRaw(logFileContent);
const visibleLines = parser.getVisibleLines();
```

### Triaging Logs

```typescript
import { LogTriageService } from "./src/services/logTriage-service";

const triage = new LogTriageService();
triage.addLogs(parsedEntries);

// Filter by level
const errors = triage.getLogs({ levels: ["error"] });

// Perform a triage action
triage.performTriageAction({ logId: "abc123", action: "resolve" });

// Get statistics
const stats = triage.getStatistics();
```

## ⚙️ Configuration

Set environment variables in a `.env` file (see `.env.example` if provided):

```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 🏗️ Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system design and component breakdown.

## 📁 Repository Structure

```
log-triage-sandbox/
├── src/
│   ├── services/
│   │   ├── log-parser-service.ts   # GitHub Actions log stream parser
│   │   └── logTriage-service.ts    # Log triage state management
│   ├── components/                  # UI components
│   ├── types/                       # TypeScript type definitions
│   ├── utils/                       # Utility helpers
│   └── styles/                      # Stylesheets
├── scripts/                         # Automation scripts
├── app.js                           # Application entry point
├── tsconfig.json                    # TypeScript config
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming conventions and contribution guidelines.

## 🔒 Security

For security concerns, see [SECURITY.md](SECURITY.md).

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
