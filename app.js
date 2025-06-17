const express = require('express');
const dotenv = require('dotenv');
const templateRouter = require('./routes/templateRoutes');
const {setResponse, sendResponse, httpStatusCode, logMessage} = require('./helpers/appHelper');
const MailService = require('./services/mail');
const WhatsappService = require('./services/whatsapp');

dotenv.config();

const app = express();
app.use((req, res, next) => {
    setResponse(res);
    const {url, method, hostname} = req;
    console.log(hostname, method, url);
    logMessage({data: {hostname, method, url}});
    next();
});

app.get('/', () => {
    sendResponse(httpStatusCode.HTTP_OK, 'Lazzycode Node API!');
});

app.use('/api/template', templateRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port: ${PORT}!\n`);

    //* Inisialisasi email, hidupkan jika diperlukan.
    // MailService.initializeMail();

    //* Inisialisasi whatsapp, hidupkan jika diperlukan.
    // WhatsappService.initializeAllClient();
});