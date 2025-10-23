export const appConfig = () => ({
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT || 4000),
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
    DATABASE_URL: process.env.DATABASE_URL || '',
    AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',                
});
