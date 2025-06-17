const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { responseToController, httpStatusCode, errorMessage, logMessage } = require('../helpers/appHelper');

dotenv.config();

let transport;
const MailService = {
    initializeMail: () => {
        console.log('MAIL: Initilisasi email')
        const transportConfig = {
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_SECURE,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        }
    
        transport = nodemailer.createTransport(transportConfig);

        transport.verify(function (error, success) {
            if (error) {
                console.log('MAIL: ❌ Koneksi Gagal:', error);
            } else {
                console.log('MAIL: ✅ Koneksi Berhasil, gas kirim email!');
            }
        });
    },
    sendMail: async ({fromName, toEmail, subject, text, html} = {}) => {
        if (!fromName || !toEmail) {
            responseToController(false, errorMessage.RES_NO_INPUT_DATA);
            return;
        }
        
        const mailOptions = {
            from: `"${fromName}" <${process.env.MAIL_USER}>`,
            to: toEmail,
            subject,
            text,
            html,
        };

        const result = await transport.sendMail(mailOptions);
        logMessage({
            filename: 'email.log',
            data: result
        });
        return result;
    }
}

module.exports = MailService;