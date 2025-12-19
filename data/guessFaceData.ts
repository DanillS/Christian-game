// Файл для добавления вопросов раунда "Угадай Лицо"
// Добавьте свои вопросы в массив
//
// Поддерживаются несколько форматов для правильных ответов:
// 1. correctAnswers: ["Иван", "Ваня"] - массив (рекомендуется)
// 2. correctAnswer: "Иван | Ваня" - строка через " | "
// 3. correctAnswer: "Иван" - одна строка

export const guessFaceData: any[] = [
  {
    image: "/images/faces/file4.png", // Фотография части тела
    fullImage: "/images/faces/file1.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Петя", "Илья", "Филипп", "Полина"],
    correctAnswer: "Филипп", // Или используйте correctAnswers: ["Филипп", "Филя"]
  },
  {
    image: "/images/faces/file19.png", // Фотография части тела
    fullImage: "/images/faces/file7.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Дарья", "Полина", "Таня", "Руфа"],
    correctAnswer: "Руфа",
  },
  {
    image: "/images/faces/file13.png", // Фотография части тела
    fullImage: "/images/faces/file8.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Елизавета", "Ниса", "Таня", "София"],
    correctAnswer: ["Елизавета", 'Лиза'],
  },
  {
    image: "/images/faces/file18.png", // Фотография части тела
    fullImage: "/images/faces/file20.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Андрюха", "Даниил", "Веньямин", "Саня"],
    correctAnswer: "Даниил",
  },
  {
    image: "/images/faces/file6.png", // Фотография части тела
    fullImage: "/images/faces/file17.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Александр 1-й", "Александр 2-й", "Витя", "Тима"],
    correctAnswer: "Александр 1-й",
  },
  {
    image: "/images/faces/file11.png", // Фотография части тела
    fullImage: "/images/faces/file12.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Даша", "Таня", "Андрей", "Веня"],
    correctAnswer: "Андрей",
  },
  {
    image: "/images/faces/file3.png", // Фотография части тела
    fullImage: "/images/faces/file16.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Филипп", "Илья", "Саня", "Кирилл"],
    correctAnswer: "Саня",
  },
  {
    image: "/images/faces/file14.png", // Фотография части тела
    fullImage: "/images/faces/file5.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Дарья", "Лиза", "Таня", "Руфа", "Полина"],
    correctAnswer: ["Таня", 'Танька'],
  },
  {
    image: "/images/faces/file9.png", // Фотография части тела
    fullImage: "/images/faces/file2.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Дарья", "Полина", "Таня", "Руфа"],
    correctAnswer: "Дарья | Даша",
  },
  {
    image: "/images/faces/file15.png", // Фотография части тела
    fullImage: "/images/faces/file10.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Света", "Лена", "Вика", "Саня", "Петя", "Витя"],
    correctAnswer: "Саня",
  },
  // Добавьте больше вопросов здесь
];
