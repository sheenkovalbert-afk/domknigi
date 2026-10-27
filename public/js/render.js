import { coverForCategory } from "./api.js";

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());

export function createBookCard(book) {
  const article = document.createElement("article");
  article.className = "book-card";

  const coverLink = document.createElement("a");
  coverLink.className = "book-cover-link";
  coverLink.href = `item.html?id=${encodeURIComponent(book.id)}`;
  coverLink.setAttribute("aria-label", `Открыть книгу «${book.title}»`);

  const cover = document.createElement("img");
  cover.className = "book-cover";
  cover.src = coverForCategory(book.categoryName);
  cover.alt = `Обложка книги «${book.title}»`;
  cover.loading = "lazy";
  coverLink.append(cover);

  const copy = document.createElement("div");
  copy.className = "book-card-copy";

  const category = document.createElement("span");
  category.className = "category-label";
  category.textContent = book.categoryName || "Без категории";

  const title = document.createElement("h3");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.className = "book-author";
  author.textContent = book.author;

  const year = document.createElement("p");
  year.className = "book-year";
  year.textContent = `Год издания: ${book.year}`;

  const detailLink = document.createElement("a");
  detailLink.className = "card-link";
  detailLink.href = `item.html?id=${encodeURIComponent(book.id)}`;
  detailLink.textContent = "Подробнее →";

  copy.append(category, title, author, year, detailLink);
  article.append(coverLink, copy);
  return article;
}

export function showEmptyState(container, message) {
  const note = document.createElement("p");
  note.className = "empty-state";
  note.textContent = message;
  container.replaceChildren(note);
}

export function setStatus(element, message, kind = "") {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("is-error", kind === "error");
  element.classList.toggle("is-success", kind === "success");
}
