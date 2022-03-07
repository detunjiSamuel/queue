require('dotenv').config()

const config = {
    flutterwave: {
        public: process.env.FLK_PUBLIC,
        private: process.env.FlK_PRIVATE,
        hash: process.env.FLK_HASH,
        encrypt: process.env.FLK_ENCRYPT
    },
    binance: {
        key: process.env.BINANCE_KEY,
        secret: process.env.BINANCE_SECRET
    },
    databaseUrl: process.env.MONGODB_URL,
    merchant: {
        title: process.env.MERCHANT_TITLE || 'ONE SHOT ITACHI' ,
        description: process.env.MERCHANT_DESCRIPTION || 'THE MOST HAXED CHARACTER',
        logo: process.env.MERCHANT_LOGO || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Mangekyou_Sharingan_Itachi.svg/300px-Mangekyou_Sharingan_Itachi.svg.png"
    },
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'http://localhost:5000',
    redis: {
        port: Number(process.env.REDIS_PORT || 6379),
        host: process.env.REDIS_HOST || "127.0.0.1",
        password: process.env.REDIS_PASSWORD || null,
        url: process.env.REDIS_URL || ''
    },
    mail: {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE || false,// remove later
        auth: {
            user: process.env.SMTP_USERNAME || 'anais.effertz53@ethereal.email',
            pass: process.env.SMTP_PASSWORD || 'hkvY3Evv9XabQUsJdB'
        },
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'random',
        expiry: process.env.JWT_EXPIRY || '3d'
    }
}

export default config