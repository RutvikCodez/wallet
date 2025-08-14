import { config } from "dotenv";
import express, { json } from "express";
import { sql } from "./config/db.js";

config();
const app = express();
app.use(json());
// app.use((req, res, next) => {
//   console.log("Middleware");
//   next()
// });
const PORT = process.env.PORT;

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;
    console.log("Database Intialized successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.send("It's working");
});

app.post("/api/transactions", async (req, res) => {
  try {
    const { user_id, title, amount, category } = req.body;
    if (!user_id || !title || amount === undefined || !category) {
      return res.status(400).json({ message: "All field are required" });
    }
    const transactions = await sql`INSERT INTO transactions(
      user_id, title, amount, category
    ) VALUES (${user_id}, ${title}, ${amount}, ${category}) RETURNING *`;
    res.status(201).json(transactions[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server rrror" });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  });
});
