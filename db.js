import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("Не задан DATABASE_URL. Скопируйте .env.example в .env и укажите доступ к PostgreSQL.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("Ошибка фонового соединения с PostgreSQL:", error.message);
});
