const express = require('express');
const router = express.Router();
const controller = require('../controllers/countryController');

router.post('/countries/refresh', controller.refreshCountries);
router.get('/countries', controller.getCountries);
router.get('/countries/image', controller.getImage);
router.get('/countries/:name', controller.getCountry);
router.delete('/countries/:name', controller.deleteCountry);
router.get('/status', controller.getStatus);

module.exports = router;
