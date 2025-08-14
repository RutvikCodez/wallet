import { config } from "dotenv";
import express from "express";

config();
const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Working!");
});
app.listen(PORT, () => {
  console.log("Server is up and running on PORT:", PORT);
});
