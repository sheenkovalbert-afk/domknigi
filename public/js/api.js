export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function getJson(url, options = {}) {
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
}

export function coverForCategory(categoryName = "") {
  const normalized = categoryName.toLocaleLowerCase("ru");
  if (normalized.includes("фантаст")) return "assets/covers/fantasy.svg";
  if (normalized.includes("приключ")) return "assets/covers/adventure.svg";
  return "assets/covers/classics.svg";
}
