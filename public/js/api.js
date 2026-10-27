export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export let usingPreviewData = false;

let previewDataPromise;

async function loadPreviewData() {
  previewDataPromise ??= fetch("/data/preview-books.json").then(async (response) => {
    if (!response.ok) throw new Error("Не удалось загрузить демонстрационный каталог.");
    return response.json();
  });
  return previewDataPromise;
}

function readPreviewBooks(preview) {
  try {
    const extra = JSON.parse(localStorage.getItem("dom-knigi-preview-items") || "[]");
    return [...preview.items, ...(Array.isArray(extra) ? extra : [])];
  } catch {
    return [...preview.items];
  }
}

async function previewRequest(url, options) {
  const preview = await loadPreviewData();
  const method = (options.method || "GET").toUpperCase();
  const path = new URL(url, window.location.origin).pathname;
  usingPreviewData = true;

  if (method === "GET" && path === "/api/categories") return preview.categories;
  if (method === "GET" && path === "/api/items") return readPreviewBooks(preview);

  const itemMatch = path.match(/^\/api\/items\/(\d+)$/);
  if (method === "GET" && itemMatch) {
    const item = readPreviewBooks(preview).find((book) => book.id === Number(itemMatch[1]));
    if (!item) throw new ApiError("Книга не найдена.", 404);
    return item;
  }

  if (method === "POST" && path === "/api/items") {
    let body;
    try {
      body = JSON.parse(options.body || "{}");
    } catch {
      throw new ApiError("Проверьте формат отправленных данных.", 400);
    }
    const category = preview.categories.find((entry) => entry.id === body.categoryId);
    if (
      typeof body.title !== "string" || !body.title.trim() ||
      typeof body.author !== "string" || !body.author.trim() ||
      typeof body.description !== "string" || !body.description.trim() ||
      !Number.isInteger(body.year) || body.year < 1500 || body.year > new Date().getFullYear() ||
      !category
    ) {
      throw new ApiError("Заполните поля и выберите категорию.", 400);
    }
    const books = readPreviewBooks(preview);
    const created = {
      id: Math.max(0, ...books.map((book) => book.id)) + 1,
      title: body.title.trim(),
      author: body.author.trim(),
      description: body.description.trim(),
      year: Number(body.year),
      categoryId: category.id,
      categoryName: category.name,
      previewOnly: true,
    };
    try {
      const extras = JSON.parse(localStorage.getItem("dom-knigi-preview-items") || "[]");
      localStorage.setItem("dom-knigi-preview-items", JSON.stringify([
        ...(Array.isArray(extras) ? extras : []), created,
      ]));
    } catch {
      throw new ApiError("Браузер не разрешил сохранить демонстрационную запись.", 400);
    }
    return created;
  }

  throw new ApiError("Маршрут API не найден.", 404);
}

export async function getJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new ApiError(data.error || `Ошибка запроса (${response.status}).`, response.status);
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) throw error;
    try {
      return await previewRequest(url, options);
    } catch (previewError) {
      if (previewError instanceof ApiError) throw previewError;
      throw error;
    }
  }
}

export function coverForCategory(categoryName = "") {
  const normalized = categoryName.toLocaleLowerCase("ru");
  if (normalized.includes("фантаст")) return "assets/covers/fantasy.svg";
  if (normalized.includes("приключ")) return "assets/covers/adventure.svg";
  return "assets/covers/classics.svg";
}
