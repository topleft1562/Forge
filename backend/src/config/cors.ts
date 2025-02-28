interface CorsConfig {
  origin: string | string[];
  methods: string[];
  credentials: boolean;
  allowedHeaders: string[];
}
const sitesThatNeedAccess = [
  "https://silver-train-76jpq9p4jgcp45g-3000.app.github.dev",
  "https://forgemain.vercel.app",
  "https://forge-opal-psi.vercel.app",
  // add others as needed
]
// const frontendUrl = "*"  // allows everything

const frontendUrl = process.env.MODE === 'local' 
// set sites available to use backend locally running or testnet
? '*'
// set sites available to use backend - production LIVE
: sitesThatNeedAccess

const corsConfig: CorsConfig = {
  origin: frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false, 
  allowedHeaders: ['Content-Type', 'Authorization']
};

export default corsConfig;
