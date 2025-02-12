# ForgePump Frontend

React-based frontend for the ForgePump platform, providing token creation, trading, and management interfaces.

## Prerequisites

- Node.js v16+
- npm or yarn
- Phantom Wallet browser extension

## Setup

1. Install dependencies:

bash
cd frontend
npm install

2. Configure environment:

bash
cp .env.example .env

Edit .env with your settings

3. Start development server:

bash
npm start

## Environment Variables

env
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com

## Project Structure

src/
├── components/ # Reusable UI components
├── pages/ # Main application pages
├── services/ # API and blockchain interactions
├── store/ # State management
└── utils/ # Helper functions

## Available Scripts

- `npm start` - Run development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run lint` - Check code style

## Contributing

Feel free to contribute, comment well the commits and changes

