const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const Country = sequelize.define('Country', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  capital: { type: DataTypes.STRING },
  region: { type: DataTypes.STRING },
  population: { type: DataTypes.BIGINT, allowNull: false },
  currency_code: { type: DataTypes.STRING },
  exchange_rate: { type: DataTypes.FLOAT },
  estimated_gdp: { type: DataTypes.FLOAT },
  flag_url: { type: DataTypes.STRING },
  last_refreshed_at: { type: DataTypes.DATE },
});

module.exports = { Country, sequelize };
