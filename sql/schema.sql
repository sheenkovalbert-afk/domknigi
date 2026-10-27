CREATE TABLE IF NOT EXISTS categories (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1500 AND 2100),
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO categories (name)
VALUES ('Русская классика'), ('Фантастика'), ('Приключения')
ON CONFLICT (name) DO NOTHING;

INSERT INTO items (title, author, description, year, category_id)
SELECT seed.title, seed.author, seed.description, seed.year, categories.id
FROM (VALUES
  ('Мастер и Маргарита', 'Михаил Булгаков', 'Роман о Москве 1930-х годов, загадочном визите Воланда и истории любви, которая соединяет разные эпохи.', 1967, 'Русская классика'),
  ('Преступление и наказание', 'Фёдор Достоевский', 'Роман о нравственном выборе бывшего студента Родионе Раскольникове и его пути к признанию.', 1866, 'Русская классика'),
  ('Мёртвые души', 'Николай Гоголь', 'Путешествие Чичикова по губернским усадьбам становится сатирической картиной общества.', 1842, 'Русская классика'),
  ('Пикник на обочине', 'Аркадий и Борис Стругацкие', 'Сталкер Рэд Шухарт отправляется в Зону, оставшуюся после загадочного Посещения Земли.', 1972, 'Фантастика'),
  ('Солярис', 'Станислав Лем', 'Учёные на орбитальной станции пытаются понять разумный океан планеты Солярис.', 1961, 'Фантастика'),
  ('Двадцать тысяч лье под водой', 'Жюль Верн', 'Профессор Аронакс и его спутники исследуют океан на борту подводного корабля «Наутилус».', 1870, 'Приключения')
) AS seed(title, author, description, year, category_name)
JOIN categories ON categories.name = seed.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM items WHERE items.title = seed.title AND items.author = seed.author
);
