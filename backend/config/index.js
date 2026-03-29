import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Supabase配置
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },

  // Manus OAuth配置
  manus: {
    clientId: process.env.MANUS_CLIENT_ID,
    clientSecret: process.env.MANUS_CLIENT_SECRET,
    redirectUri: process.env.MANUS_REDIRECT_URI
  },

  // Dify配置
  dify: {
    apiUrl: process.env.DIFY_API_URL,
    apiKey: process.env.DIFY_API_KEY
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};
