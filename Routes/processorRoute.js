const router = require('express').Router();

const { processPayment } = require('../PaymentProcessor/processor');

router.post('/payment', processPayment);

module.exports = router;