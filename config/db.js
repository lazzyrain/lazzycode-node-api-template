const mysql = require('mysql2');
const dotenv = require('dotenv');
const {throwResult, httpStatusCode} = require('../helpers/appHelper')

dotenv.config();

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

const promisePool = connection.promise();

const executeTransactionQuery = async (callback) => {
    const connection = await promisePool.getConnection();

    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();

        connection.release();
        return throwResult(httpStatusCode.HTTP_OK, result ?? {});
    } catch (error) {
        await connection.rollback();

        connection.release();
        console.log(error);
        return throwResult(httpStatusCode.HTTP_INTERNAL_SERVER_ERROR, error);
    }
}

const executeQuery = async (query, params = [], singleRow = false) => {
    const connection = await promisePool.getConnection();

    try {
        let [result] = await connection.execute(query, params);
        connection.release();

        if (singleRow) return throwResult(httpStatusCode.HTTP_OK, result[0] ?? {});

        return throwResult(httpStatusCode.HTTP_OK, result ?? {});
    } catch (error) {
        connection.release();
        console.log(error);
        return throwResult(httpStatusCode.HTTP_INTERNAL_SERVER_ERROR, error);
    }
}

module.exports = {
    promisePool,
    executeTransactionQuery,
    executeQuery
};