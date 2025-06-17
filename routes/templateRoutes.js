const express = require('express');
const multer = require('multer');
const formData = multer();
const router = express.Router();
const {validateRequestBody} = require('../helpers/appHelper');
const TemplateController = require('../controllers/templateController');

router.get(
    '/test-model',
    TemplateController.testModel
);

router.get(
    '/test-get',
    TemplateController.testGet
);

router.post(
    '/test-post',
    formData.none(),
    // validateRequestBody(), // Gunakan ini jika wajib ada data body yang dikirim
    TemplateController.testPost
);

module.exports = router;