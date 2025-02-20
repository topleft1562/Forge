interface CorsConfig {
  origin: string | string[];
  methods: string[];
  credentials: boolean;
  allowedHeaders: string[];
}
// const frontendUrl = "https://cautious-space-system-pqg759g6975cw95-3000.app.github.dev";
const frontendUrl = "*"
const corsConfig: CorsConfig = {
  origin: frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false, 
  allowedHeaders: ['Content-Type', 'Authorization']
};

export default corsConfig;
