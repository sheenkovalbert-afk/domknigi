import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(currentDir, "public");

const itemSelect = `
  SELECT
    i.id,
    i.title,
    i.author,
    i.description,
    i.year,
    i.category_id AS "categoryId",
    c.name AS "categoryName"
  FROM items AS i
  JOIN categories AS c ON c.id = i.category_id
`;

app.use(express.json({ limit: "32kb" }));

app.get("/api/categories", async (_request, response) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM categories ORDER BY name"
    );
    response.json(result.rows);
  } catch (error) {
    console.error("GET /api/categories:", error.message);
    response.status(500).json({ error: "Не удалось загрузить категории." });
  }
});

app.get("/api/items", async (_request, response) => {
  try {
    const result = await pool.query(`${itemSelect} ORDER BY i.title, i.id`);
    response.json(result.rows);
  } catch (error) {
    console.error("GET /api/items:", error.message);
    response.status(500).json({ error: "Не удалось загрузить каталог." });
  }
});

app.get("/api/items/:id", async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: "Идентификатор должен быть положительным целым числом." });
  }

  try {
    const result = await pool.query(`${itemSelect} WHERE i.id = $1`, [id]);
    if (result.rowCount === 0) {
      return response.status(404).json({ error: "Книга не найдена." });
    }
    response.json(result.rows[0]);
  } catch (error) {
    console.error(`GET /api/items/${id}:`, error.message);
    response.status(500).json({ error: "Не удалось загрузить книгу." });
  }
});

app.post("/api/items", async (request, response) => {
  const body = request.body ?? {};
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const year = body.year;
  const categoryId = body.categoryId;

  if (!title || title.length > 200) {
    return response.status(400).json({ error: "Название обязательно и должно быть не длиннее 200 символов." });
  }
  if (!author || author.length > 140) {
    return response.status(400).json({ error: "Укажите автора (не более 140 символов)." });
  }
  if (!description) {
    return response.status(400).json({ error: "Добавьте краткое описание книги." });
  }
  if (!Number.isInteger(year) || year < 1500 || year > new Date().getFullYear()) {
    return response.status(400).json({ error: "Год должен быть целым числом от 1500 до текущего года." });
  }
  if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
    return response.status(400).json({ error: "Выберите существующую категорию." });
  }

  try {
    const category = await pool.query(
      "SELECT id, name FROM categories WHERE id = $1",
      [categoryId]
    );
    if (category.rowCount === 0) {
      return response.status(400).json({ error: "Выбранная категория не существует." });
    }

    const result = await pool.query(
      `INSERT INTO items (title, author, description, year, category_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, author, description, year, category_id AS "categoryId"`,
      [title, author, description, year, categoryId]
    );
    response.status(201).json({
      ...result.rows[0],
      categoryName: category.rows[0].name,
    });
  } catch (error) {
    console.error("POST /api/items:", error.message);
    response.status(500).json({ error: "Не удалось добавить книгу. Попробуйте позже." });
  }
});

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "Маршрут API не найден." });
});

app.use(express.static(publicDir));

app.use((_request, response) => {
  response.status(404).sendFile(path.join(publicDir, "404.html"));
});

app.listen(port, () => {
  console.log(`Сайт библиотеки: http://localhost:${port}`);
});
