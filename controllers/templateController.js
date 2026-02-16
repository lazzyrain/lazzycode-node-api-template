const {sendResponse, httpStatusCode} = require('../helpers/appHelper')
const TemplateModel = require('../models/templateModel')

const TemplateController = {
    testModel: () => {
        sendResponse(httpStatusCode.HTTP_OK, 'Model berhasil', TemplateModel.testModel())
    },
    testGet: () => {
        sendResponse(httpStatusCode.HTTP_OK, 'GET berhasil')
    },
    testPost: () => {
        sendResponse(httpStatusCode.HTTP_OK, 'POST berhasil')
    }
}

module.exports = TemplateController