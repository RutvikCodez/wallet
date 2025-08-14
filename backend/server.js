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

app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions =
      await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;
    res.status(200).json(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server rrror" });
  }
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

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Inavalid Transactions ID" });
    }
    const result =
      await sql`DELETE FROM transactions WHERE id = ${id} RETURNING *`;
    if (result.length === 0) {
      return res.status(404).json({ message: "Transactions not found" });
    }
    res.status(200).json({ message: "Transactions deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server rrror" });
  }
});

app.get("/api/transactions/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const balanceResult =
      await sql`SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}`;
    const incomeResult =
      await sql`SELECT COALESCE(SUM(amount), 0) as income FROM transactions WHERE user_id = ${userId} AND amount > 0`;
    const expensesResult =
      await sql`SELECT COALESCE(SUM(amount), 0) as expenses FROM transactions WHERE user_id = ${userId} AND amount < 0`;
    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses
    });
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
