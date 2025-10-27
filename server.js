require('dotenv').config();
const express = require('express');
const app = express();

const { sequelize } = require('./models/countryModel');
const countryRoutes = require('./routes/countryRoutes');

app.use(express.json());
app.use('/', countryRoutes);

const PORT = process.env.PORT || 8080;
console.log(PORT);

// Start the server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
    
    await sequelize.sync();
    console.log('Models synchronized!');
    
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

startServer();