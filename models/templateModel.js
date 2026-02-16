const {sendResponse, httpStatusCode, errorMessage} = require('../helpers/appHelper');
const {executeTransactionQuery, executeQuery} = require('../config/db');

/**
 * TemplateModel - Contoh penggunaan fungsi DB helper
 */
const TemplateModel = {
    /**
     * Menambahkan user baru
     */
    addUser: async (firstName, lastName) => {
        const result = await executeTransactionQuery(async (connection) => {
            const query = `
                INSERT INTO user (first_name, last_name)
                VALUES (?, ?)
            `;
            const [res] = await connection.query(query, [firstName, lastName]);
            return res;
        });

        if (result?.status !== 200) {
            return sendResponse(
                httpStatusCode.HTTP_INTERNAL_SERVER_ERROR,
                errorMessage.RES_INTERNAL_SERVER_ERROR
            );
        }

        return result;
    },

    /**
     * Mengambil daftar user
     */
    getListUser: async () => {
        const query = `SELECT * FROM users`;
        const result = await executeQuery(query);

        if (result?.status !== 200) {
            return sendResponse(
                httpStatusCode.HTTP_INTERNAL_SERVER_ERROR,
                errorMessage.RES_INTERNAL_SERVER_ERROR
            );
        }

        return result;
    },

    /**
     * Mengambil detail user berdasarkan ID
     */
    getDetailUser: async (userID) => {
        const result = await executeQuery(
            `SELECT * FROM users WHERE id = ?`,
            [userID],
            true // hanya ambil 1 baris
        );

        if (result?.status !== 200) {
            return sendResponse(
                httpStatusCode.HTTP_INTERNAL_SERVER_ERROR,
                errorMessage.RES_INTERNAL_SERVER_ERROR
            );
        }

        return result;
    },

    testModel: () => {
        return ['HELLO FROM MODEL'];
    }
};

module.exports = TemplateModel;