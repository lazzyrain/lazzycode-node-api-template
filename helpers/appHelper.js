const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const dotenv = require('dotenv');

dotenv.config();

// * General
const errorMessage = {
    RES_UNAUTHORIZED: process.env.RES_UNAUTHORIZED,
    RES_NO_INPUT_DATA: process.env.RES_NO_INPUT_DATA,
    RES_INTERNAL_SERVER_ERROR: process.env.RES_INTERNAL_SERVER_ERROR,
    RES_NO_OUTPUT_DATA: process.env.RES_NO_OUTPUT_DATA,
    RES_DATA_NOT_FOUND: process.env.RES_DATA_NOT_FOUND,
};

const httpStatusCode = {
    HTTP_OK: process.env.HTTP_OK,
    HTTP_CREATED: process.env.HTTP_CREATED,
    HTTP_NO_CONTENT: process.env.HTTP_NO_CONTENT,
    HTTP_BAD_REQUEST: process.env.HTTP_BAD_REQUEST,
    HTTP_UNAUTHORIZED: process.env.HTTP_UNAUTHORIZED,
    HTTP_FORBIDDEN: process.env.HTTP_FORBIDDEN,
    HTTP_NOT_FOUND: process.env.HTTP_NOT_FOUND,
    HTTP_METHOD_NOT_ALLOWED: process.env.HTTP_METHOD_NOT_ALLOWED,
    HTTP_INTERNAL_SERVER_ERROR: process.env.HTTP_INTERNAL_SERVER_ERROR,
    HTTP_BAD_GATEWAY: process.env.HTTP_BAD_GATEWAY,
    HTTP_SERVICE_UNAVAILABLE: process.env.HTTP_SERVICE_UNAVAILABLE,
    HTTP_GATEWAY_TIMEOUT: process.env.HTTP_GATEWAY_TIMEOUT,
};

let res;
const setResponse = (response) => {
    res = response;
}

const sendResponse = (statusCode, message = '', data = []) => {
    if (res.headersSent) return;
    res.status(+statusCode).json({
        status: +statusCode, 
        message,
        data
    });
};

const responseToController = (status, message = '', data = []) => {
    return {
        status, 
        message,
        data
    };
};

const requireValue = (value, label = null) => {
    if (!value || value === undefined) {
        return sendResponse(
            httpStatusCode.HTTP_BAD_REQUEST,
            errorMessage.RES_NO_INPUT_DATA,
            label ?? []
        );
    }
    return true;
}

const isEmpty = (value) => {
    if (Array.isArray(value)) {
        return value.length === 0;
    } else if (value && typeof value === 'object') {
        return Object.keys(value).length === 0;
    }
    return !value;
};

const getDateTimeNow = ({ tz = 'Asia/Jakarta', offsetHour } = {}) => {
    let datetime;

    if (typeof offsetHour === 'number') {
        datetime = moment().utcOffset(offsetHour);
    } else {
        datetime = moment().tz(tz);
    }

    return datetime.format('YYYY-MM-DD HH:mm:ss');
};

const throwResult = (status, data = []) => {
    return {status, data}
}

const generateNumber = (length) => {
    const max = Math.pow(10, length) - 1;
    const min = Math.pow(10, length - 1);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const formatPhoneNumber = (phoneNumber) => {
    phoneNumber = phoneNumber.replace(/\D/g, '');

    if (phoneNumber.startsWith('08')) {
        return '62' + phoneNumber.slice(1);
    }

    if (phoneNumber.startsWith('628')) {
        return phoneNumber;
    }

    if (phoneNumber.startsWith('62')) {
        return phoneNumber;
    }

    if (phoneNumber.startsWith('8')) {
        return '62' + phoneNumber;
    }

    return phoneNumber;
}

const logMessage = ({filename = 'access.log', data}) => {
    const logData = {
        timestamp: new Date().toISOString(),
        ...data,
    };

    const logLine = JSON.stringify(logData) + '\n';
    const logsDir = path.join(process.cwd(), 'logs');
    const logFilePath = path.join(logsDir, filename);

    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    fs.appendFile(logFilePath, logLine, (err) => {
        if (err) {
            console.error('Gagal menyimpan log:', err);
        } else {
            console.log(`Log tersimpan ke ${filename}:`, logLine.trim());
        }
    });
};

// * Middleware
const validateRequestBody = () => (req, res, next) =>{
    if (!req.body) return sendResponse(process.env.HTTP_BAD_REQUEST, process.env.RES_NO_INPUT_DATA);
    next();
}

module.exports = {
    setResponse,
    sendResponse,
    requireValue,
    throwResult,
    getDateTimeNow,
    generateNumber,
    validateRequestBody,
    errorMessage,
    httpStatusCode,
    isEmpty,
    formatPhoneNumber,
    responseToController,
    logMessage
}