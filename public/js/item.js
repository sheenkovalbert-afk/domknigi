import { getJson, coverForCategory } from "./api.js";
import { setStatus } from "./render.js";

const status = document.querySelector("#item-status");
const content = document.querySelector("#item-content");

function showNotFound(message) {
  setStatus(status, "");
  const note = document.createElement("p");
  note.className = "empty-state";
  note.textContent = message;
  const link = document.createElement("a");
  link.className = "button button-primary";
  link.href = "catalog.html";
  link.textContent = "Вернуться в каталог";
  status.after(note, link);
}

if (status && content) {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    showNotFound("Не указан номер книги. Откройте карточку из каталога.");
  } else {
    try {
      const book = await getJson(`/api/items/${encodeURIComponent(id)}`);
      document.title = `${book.title} — Дом книги`;
      document.querySelector("#item-category").textContent = book.categoryName;
      document.querySelector("#item-title").textContent = book.title;
      document.querySelector("#item-author").textContent = book.author;
      document.querySelector("#item-year").textContent = `Год издания: ${book.year}`;
      document.querySelector("#item-description").textContent = book.description;
      const cover = document.querySelector("#item-cover");
      cover.src = coverForCategory(book.categoryName);
      cover.alt = `Обложка книги «${book.title}»`;
      setStatus(status, "");
      content.hidden = false;
    } catch (error) {
      if (error.status === 404 || error.status === 400) {
        showNotFound("Эта книга не найдена. Проверьте ссылку или вернитесь в каталог.");
      } else {
        setStatus(status, "Не удалось загрузить карточку. Проверьте подключение и попробуйте ещё раз.", "error");
      }
      console.error(error);
    }
  }
}
