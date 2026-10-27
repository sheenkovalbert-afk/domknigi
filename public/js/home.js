import { getJson } from "./api.js";
import { createBookCard, setStatus, showEmptyState } from "./render.js";

const container = document.querySelector("#featured-books");
const status = document.querySelector("#home-status");

if (container && status) {
  try {
    const books = await getJson("/api/items");
    if (books.length === 0) {
      setStatus(status, "Пока на полках нет книг.");
      showEmptyState(container, "Каталог пока пуст. Добавьте первую книгу.");
    } else {
      setStatus(status, "");
      container.replaceChildren(...books.slice(0, 3).map(createBookCard));
    }
  } catch (error) {
    setStatus(status, "Не удалось загрузить книги. Проверьте подключение и попробуйте обновить страницу.", "error");
    console.error(error);
  }
}
