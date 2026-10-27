import { getJson, usingPreviewData } from "./api.js";
import { createBookCard, setStatus } from "./render.js";

const form = document.querySelector("#book-form");
const categorySelect = document.querySelector("#category-id");
const feedback = document.querySelector("#form-feedback");
const preview = document.querySelector("#created-preview");
const submitButton = document.querySelector("#submit-book");

if (form && categorySelect && feedback && preview && submitButton) {
  try {
    const categories = await getJson("/api/categories");
    categorySelect.append(...categories.map((category) => {
      const option = document.createElement("option");
      option.value = String(category.id);
      option.textContent = category.name;
      return option;
    }));
    if (usingPreviewData) {
      setStatus(feedback, "Демо-режим: новые книги сохраняются только в этом браузере.");
    }
  } catch (error) {
    setStatus(feedback, "Не удалось загрузить категории. Обновите страницу перед отправкой.", "error");
    categorySelect.disabled = true;
    submitButton.disabled = true;
    console.error(error);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    preview.replaceChildren();

    const formData = new FormData(form);
    const book = {
      title: String(formData.get("title") || "").trim(),
      author: String(formData.get("author") || "").trim(),
      year: Number(formData.get("year")),
      categoryId: Number(formData.get("categoryId")),
      description: String(formData.get("description") || "").trim(),
    };

    if (!form.reportValidity()) return;
    if (!book.title || !book.author || !book.description || !Number.isInteger(book.year) || !Number.isInteger(book.categoryId)) {
      setStatus(feedback, "Заполните все поля корректно.", "error");
      return;
    }
    if (book.year < 1500 || book.year > new Date().getFullYear()) {
      setStatus(feedback, "Укажите год от 1500 до текущего года.", "error");
      return;
    }

    submitButton.disabled = true;
    setStatus(feedback, "Добавляем книгу…");
    try {
      const created = await getJson("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      const message = created.previewOnly
        ? `Демо-книга «${created.title}» сохранена в этом браузере.`
        : `Книга «${created.title}» добавлена в каталог.`;
      setStatus(feedback, message, "success");
      preview.append(createBookCard(created));
      form.reset();
    } catch (error) {
      setStatus(feedback, error.status === 400 ? error.message : "Не удалось добавить книгу. Проверьте соединение и попробуйте ещё раз.", "error");
      console.error(error);
    } finally {
      submitButton.disabled = false;
    }
  });
}
