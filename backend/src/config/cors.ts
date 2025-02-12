interface CorsConfig {
  origin: string | string[];
  methods: string[];
  credentials: boolean;
  allowedHeaders: string[];
}

const corsConfig: CorsConfig = {
  origin: "*", 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false, 
  allowedHeaders: ['Content-Type', 'Authorization']
};

export default corsConfig;