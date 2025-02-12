# ForgePump Backend

Node.js backend service handling token operations and blockchain interactions for ForgePump.

## Prerequisites

- Node.js v16+
- MongoDB
- Solana CLI tools

## Setup

1. Install dependencies:

bash
cd backend
npm install

2. Configure environment:

bash
cp .env.example .env

Edit .env with your settings

3. Start server:

bash
npm run dev

## Environment Variables

env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/forgepump
PRIVATE_KEY=your_solana_private_key
SOLANA_RPC_URL=https://api.devnet.solana.com

## API Endpoints

- `POST /api/tokens/create` - Create new token
- `GET /api/tokens` - List all tokens
- `GET /api/tokens/:id` - Get token details
- `POST /api/swap` - Execute token swap

## Project Structure

src/
├── models/ # Database models
├── routes/ # API routes
├── program/ # Blockchain interactions
├── utils/ # Helper functions
└── config/ # Configuration files

## Available Scripts

- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Check code style

