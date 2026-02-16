const dotenv = require('dotenv');
const redis = require('redis');

dotenv.configDotenv();

const connectToRedis = async () => {
    const client = redis.createClient({
        url: process.env.REDIS_URL
    });
    await client.connect();

    return client;
}

const RedisService = {
    saveClientWhatsApp: async (clientId) => {
        const rds = await connectToRedis();
        await rds.set(`client:${clientId}`, JSON.stringify({}));
        console.log(`WA: Berhasil menyimpan client:${clientId} ke redis!`);
        return;
    },
    getAllClientWhatsApp: async () => {
        const rds = await connectToRedis();
        const clients = await rds.keys('client:*');

        return clients;
    }
}

module.exports = RedisService;