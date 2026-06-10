const express = require("express");
const sequelize = require("./config/database.config");
const authRoutes = require("./routes/auth.routes");

const app = express();
const port = process.env.API_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.use("/api/auth", authRoutes);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    await sequelize.sync({ alter: true });
    console.log("Models synchronized");

    app.listen(port, () => {
      console.log(`Auth service running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Unable to connect to database:", err);
  }
}

startServer();