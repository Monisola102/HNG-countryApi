require("dotenv").config();
const express = require("express");
const app = express();

const { sequelize } = require("./models/countryModel");
const countryRoutes = require("./routes/countryRoutes");

app.use(express.json());
app.use("/", countryRoutes);

const PORT = process.env.PORT || 8080;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully!");
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
