import { getJson } from "./api.js";
import { createBookCard, setStatus, showEmptyState } from "./render.js";

const searchInput = document.querySelector("#book-search");
const categorySelect = document.querySelector("#category-filter");
const catalog = document.querySelector("#catalog");
const status = document.querySelector("#catalog-status");
const resultCount = document.querySelector("#result-count");

if (searchInput && categorySelect && catalog && status && resultCount) {
  let books = [];

  function renderFilteredBooks() {
    const query = searchInput.value.trim().toLocaleLowerCase("ru");
    const selectedCategory = categorySelect.value;
    const filtered = books.filter((book) => {
      const matchesTitle = book.title.toLocaleLowerCase("ru").includes(query);
      const matchesCategory = selectedCategory === "all" || String(book.categoryId) === selectedCategory;
      return matchesTitle && matchesCategory;
    });

    resultCount.textContent = `Найдено: ${filtered.length}`;
    if (filtered.length === 0) {
      showEmptyState(catalog, "Ничего не найдено. Измените запрос или выберите другую категорию.");
      return;
    }
    catalog.replaceChildren(...filtered.map(createBookCard));
  }

  searchInput.addEventListener("input", renderFilteredBooks);
  categorySelect.addEventListener("change", renderFilteredBooks);

  try {
    const [items, categories] = await Promise.all([
      getJson("/api/items"),
      getJson("/api/categories"),
    ]);
    books = items;
    const options = categories.map((category) => {
      const option = document.createElement("option");
      option.value = String(category.id);
      option.textContent = category.name;
      return option;
    });
    categorySelect.append(...options);
    setStatus(status, "");
    renderFilteredBooks();
  } catch (error) {
    setStatus(status, "Не удалось загрузить каталог. Проверьте, что сервер и база данных запущены.", "error");
    resultCount.textContent = "";
    console.error(error);
  }
}
