const express = require('express');
const {contactUs} = require('../Controller/contactUsController');
const router = express.Router();

router.post('/contact', contactUs);

module.exports = router;