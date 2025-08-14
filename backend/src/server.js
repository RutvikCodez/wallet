import { config } from "dotenv";
import express, { json } from "express";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import { initDB } from "./config/db.js";

config();
const app = express();
app.use(json());
app.use(rateLimiter);
const PORT = process.env.PORT;

app.use("/api/transactions", transactionsRoute);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  });
});
