const { Client, LocalAuth } = require('whatsapp-web.js');
const RedisService = require('./redis');
const { formatPhoneNumber, responseToController, logMessage } = require('../helpers/appHelper');

const clients = {};

const WhatsappService = {
    initializeAllClient: async function() {
        console.log('WA: Mengambil semua client WhastApp pada redis');
        const allClient = await RedisService.getAllClientWhatsApp();
        if (allClient.length <= 0) {
            console.log('WA: Tidak ada client di redis!');
            return;
        }
        
        console.log(`WA: Terdapat ${allClient.length} client pada redis!`);
        await Promise.all(
            allClient.map(async client => {
                const clientId = client.split(':')[1];
                await this.initializeClient(clientId);
            })
        )
    },
    initializeClient: async function(clientId, onQrCode) {
        console.log(`WA: Inisialisasi client:${clientId}...`);;
        let client;
        let countGenerate = 0;

        client = new Client({
            authStrategy: new LocalAuth({
                dataPath: './whatsAppAuth',
                clientId: clientId
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            },
        });
        
        client.on('ready', () => {
            console.log(`WA: Client:${clientId}, siap digunakan!`);
        });
        
        if (onQrCode) {
            const qrListener = client.on('qr', qr => {
                console.log(`WA: Client:${clientId}, QR sudah di-generate!`);
                console.log(countGenerate);
                if (countGenerate >= 1) {
                    console.log(`WA: Client:${clientId}, hapus event QR`);
                    client.removeListener('qr', qrListener);
                    countGenerate = 0;
                    return;
                }
                countGenerate++;
                onQrCode(qr);
            });
        }
        
        //* Event ketika ada pesan masuk atau mengirim pesan keluar
        client.on('message_create', message => {
            // console.log(message.body);
        });

        client.on('auth_failure', message => {
            console.error('WA: ❌ AUTH FAILED', message);
        });
        
        client.on('disconnected', async reason => {
            console.error('WA: ⚠️ DISCONNECTED:', reason);
            client.removeAllListeners();
            await client.destroy();
        });
        
        await client.initialize();
        clients[clientId] = client;
        await RedisService.saveClientWhatsApp(clientId);
        
        return responseToController(true, 'Berhasil', client);
    },
    sendMessage: async function(clientId, phone, message) {
        const client = clients[clientId];
        if (!client) {
            return responseToController(false, `Client:${clientId} tidak ditemukan!`);
        }; 

        const chatId = `${formatPhoneNumber(phone)}@c.us`;
        const send = client.sendMessage(chatId, message);
        logMessage({
            filename: 'whatsapp.log',
            data: send
        });
        return responseToController(true, 'Berhasil mengirim pesan', send);
    }
}

module.exports = WhatsappService