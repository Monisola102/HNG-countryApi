const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Country } = require('../models/countryModel');
const generateSummaryImage = require('../utils/generateImage');

let lastRefreshedAt = null;

const refreshCountries = async (req, res) => {
  try {
    console.log('Refreshing countries...');
    const countryRes = await axios.get(
      'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies'
    );
    const exchangeRes = await axios.get('https://open.er-api.com/v6/latest/USD');

    const countriesData = countryRes.data;
    const exchangeRates = exchangeRes.data.rates;

    const promises = countriesData.map(async (country) => {
      const currencyCode = country.currencies?.[0]?.code || null;
      const exchangeRate = currencyCode ? exchangeRates[currencyCode] || null : null;
      const estimatedGdp =
        exchangeRate && currencyCode
          ? (country.population * (Math.random() * (2000 - 1000) + 1000)) / exchangeRate
          : 0;

      return Country.upsert({
        name: country.name,
        capital: country.capital || null,
        region: country.region || null,
        population: country.population,
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        estimated_gdp: estimatedGdp,
        flag_url: country.flag || null,
        last_refreshed_at: new Date(),
      });
    });

    await Promise.all(promises);
    const allCountries = await Country.findAll();
    lastRefreshedAt = new Date();

    await generateSummaryImage(allCountries, lastRefreshedAt);

    res.json({ message: 'Countries refreshed successfully' });
  } catch (err) {
    console.error(' Refresh error:', err.message);
    res.status(503).json({
      error: 'External data source unavailable',
      details: err.message,
    });
  }
};

const getCountries = async (req, res) => {
  const { region, currency, sort } = req.query;
  let where = {};
  if (region) where.region = region;
  if (currency) where.currency_code = currency;

  let countries = await Country.findAll({ where });

  if (sort === 'gdp_desc') {
    countries.sort((a, b) => (b.estimated_gdp || 0) - (a.estimated_gdp || 0));
  }

  res.json(countries);
};

const getCountry = async (req, res) => {
  const country = await Country.findOne({ where: { name: req.params.name } });
  if (!country) return res.status(404).json({ error: 'Country not found' });
  res.json(country);
};

const deleteCountry = async (req, res) => {
  const result = await Country.destroy({ where: { name: req.params.name } });
  if (!result) return res.status(404).json({ error: 'Country not found' });
  res.json({ message: 'Country deleted successfully' });
};

const getStatus = async (req, res) => {
  const total = await Country.count();
  res.json({ total_countries: total, last_refreshed_at: lastRefreshedAt });
};

const getImage = (req, res) => {
  try {
    const imagePath = path.resolve(__dirname, '../cache/summary.png');
    console.log('🖼️ Looking for image at:', imagePath);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Summary image not found' });
    }
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
};

module.exports = {
  refreshCountries,
  getCountries,
  getCountry,
  deleteCountry,
  getStatus,
  getImage,
};
