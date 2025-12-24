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
    correctAnswer: ["Филипп", 'Филя', 'Филка', 'Филип', 'Фелип'], // Или используйте correctAnswers: ["Филипп", "Филя"]
  },
  {
    image: "/images/faces/file19.png", // Фотография части тела
    fullImage: "/images/faces/file7.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Дарья", "Полина", "Таня", "Руфа"],
    correctAnswer: ["Руфа", 'хочу Феррари', 'Руфь', 'Руфина'],
  },
  {
    image: "/images/faces/file13.png", // Фотография части тела
    fullImage: "/images/faces/file8.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Елизавета", "Ниса", "Таня", "София"],
    correctAnswer: ["Елизавета", 'не крутите мяч пж', 'Лизонька', 'Элиза', 'Лиз', 'Лиза'],
  },
  {
    image: "/images/faces/file18.png", // Фотография части тела
    fullImage: "/images/faces/file20.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Андрюха", "Даниил", "Веньямин", "Саня"],
    correctAnswer: ["Даниил", 'Синоптик', 'Даня', 'Данил'],
  },
  {
    image: "/images/faces/file6.png", // Фотография части тела
    fullImage: "/images/faces/file17.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Александр 1-й", "Александр 2-й", "Витя", "Тима"],
    correctAnswer:["Александр 1-й", 'Саня', 'Владелец', 'Нина...', 'Санчес', "Саша", 'Александр', "Степанов"],
  },
  {
    image: "/images/faces/file11.png", // Фотография части тела
    fullImage: "/images/faces/file12.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Даша", "Таня", "Андрей", "Веня"],
    correctAnswer: ["Андрей", "Балобан", "а че не так то", "Эндрю"],
  },
  {
    image: "/images/faces/file3.png", // Фотография части тела
    fullImage: "/images/faces/file16.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Филипп", "Илья", "Саня", "Кирилл"],
    correctAnswer: ["Саня", 'Вотяк', "Петров", "Саша", "Александр"],
  },
  {
    image: "/images/faces/file14.png", // Фотография части тела
    fullImage: "/images/faces/file5.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Дарья", "Лиза", "Таня", "Руфа", "Полина"],
    correctAnswer: ["Таня", 'Бобренок младший', "Танюша", "Танька", "Татьяна"],
  },
  {
    image: "/images/faces/file9.png", // Фотография части тела
    fullImage: "/images/faces/file2.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: ["Дарья", "Полина", "Таня", "Руфа"],
    correctAnswer: ["Даша", 'Дарья', 'Дашуля', 'Мазда 6', 'Дашка'],
  },
  {
    image: "/images/faces/file15.png", // Фотография части тела
    fullImage: "/images/faces/file10.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [],
    correctAnswer: ["Саня", 'Саша', "Яковлев"],
  },
  {
    image: "/images/faces/file76.png", // Фотография части тела
    fullImage: "/images/faces/file30.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [1],
    correctAnswer: ["Саня",  'Вотяк', "Петров", "Саша", "Александр"],
  },
  {
    image: "/images/faces/file70.png", // Фотография части тела
    fullImage: "/images/faces/file81.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [2],
    correctAnswer: ["Веня", 'Веньямин', "Ваня", 'Перекуп'],
  },
  {
    image: "/images/faces/file62.png", // Фотография части тела
    fullImage: "/images/faces/file47.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [3],
    correctAnswer: ["Александр 1-й", 'Саня', 'Владелец', 'Нина...', 'Санчес', "Саша", 'Александр', "Степанов"],
  },
  {
    image: "/images/faces/file40.png", // Фотография части тела
    fullImage: "/images/faces/file35.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [4],
    correctAnswer: ["Елизавета", 'Лиза'],
  },
  {
    image: "/images/faces/file71.png", // Фотография части тела
    fullImage: "/images/faces/file54.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [5],
    correctAnswer: ["Аня", 'Анна', "Яковлева"],
  },
  {
    image: "/images/faces/file80.png", // Фотография части тела
    fullImage: "/images/faces/file86.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [6],
    correctAnswer: ["Веня", 'Веньямин', "Ваня", 'Перекуп'],
  },
  {
    image: "/images/faces/file34.png", // Фотография части тела
    fullImage: "/images/faces/file37.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [7],
    correctAnswer: ["Саня",  'Вотяк', "Петров", "Саша", "Александр"],
  },
  {
    image: "/images/faces/file22.png", // Фотография части тела
    fullImage: "/images/faces/file85.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [8],
    correctAnswer: ["Данил", 'Денчик', "Яковлев", "Даниил", "Даня"],
  },
  {
    image: "/images/faces/file26.png", // Фотография части тела
    fullImage: "/images/faces/file83.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [9],
    correctAnswer: ["Дина", 'Бобренок старший', "Динчик", "Диночка"],
  },
  {
    image: "/images/faces/file58.png", // Фотография части тела
    fullImage: "/images/faces/file74.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [10],
    correctAnswer: ["Даша", 'Дарья', 'Дашуля', 'Мазда 6', 'Дашка'],
  },
  {
    image: "/images/faces/file51.png", // Фотография части тела
    fullImage: "/images/faces/file55.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [11],
    correctAnswer: ["Илья", 'Албанец', "Илюша"],
  },
  {
    image: "/images/faces/file43.png", // Фотография части тела
    fullImage: "/images/faces/file42.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [12],
    correctAnswer: ["Даша", 'Дарья', 'Дашуля', 'Мазда 6', 'Дашка'],
  },
  {
    image: "/images/faces/file50.png", // Фотография части тела
    fullImage: "/images/faces/file39.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [13],
    correctAnswer: ["Этиенн", 'Тима', "Африканец", "и много других аналогий", "ок, вода", "где-то смеется Саня Петров и Веня"],
  },
  {
    image: "/images/faces/file77.png", // Фотография части тела
    fullImage: "/images/faces/file68.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [14],
    correctAnswer: ["Артем", 'Шмаков'],
  },
  {
    image: "/images/faces/file21.png", // Фотография части тела
    fullImage: "/images/faces/file33.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [15],
    correctAnswer: ["Виктор", 'Витя', "Б.д.к", "Викторио"],
  },
  {
    image: "/images/faces/file75.png", // Фотография части тела
    fullImage: "/images/faces/file88.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [16],
    correctAnswer: ["Петя", 'Шмаков', "Петруша", "Петр"],
  },
  {
    image: "/images/faces/file64.png", // Фотография части тела
    fullImage: "/images/faces/file90.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [17],
    correctAnswer: ["Тима", 'Тимофей', 'Черныш', 'Албанстрой', 'Тимоша', "Тимоха"],
  },
  {
    image: "/images/faces/file36.png", // Фотография части тела
    fullImage: "/images/faces/file45.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [18],
    correctAnswer: ["Филипп", 'Филя', 'Филка', 'Филип', 'Фелип']
    ,
  },
  {
    image: "/images/faces/file41.png", // Фотография части тела
    fullImage: "/images/faces/file63.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [19],
    correctAnswer: ["Веня", 'Веньямин', "Ваня", 'Перекуп'],
  },
  {
    image: "/images/faces/file87.png", // Фотография части тела
    fullImage: "/images/faces/file23.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [20],
    correctAnswer: ["Саня",  'Саша', "Яковлев"]
    ,
  },
  {
    image: "/images/faces/file72.png", // Фотография части тела
    fullImage: "/images/faces/file52.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [21],
    correctAnswer: ["Филипп", 'Филя', 'Филка', 'Филип', 'Фелип']
    ,
  },
  {
    image: "/images/faces/file78.png", // Фотография части тела
    fullImage: "/images/faces/file31.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [22],
    correctAnswer: ["Филипп", 'Филя', 'Филка', 'Филип', 'Фелип']
    ,
  },
  {
    image: "/images/faces/file65.png", // Фотография части тела
    fullImage: "/images/faces/file69.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [23],
    correctAnswer: ["Софа", 'Софья', 'Степанова'],
  },
  {
    image: "/images/faces/file67.png", // Фотография части тела
    fullImage: "/images/faces/file44.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [24],
    correctAnswer: ["Данил", 'Даня', 'Степанов', 'Денчик'],
  },
  {
    image: "/images/faces/file59.png", // Фотография части тела
    fullImage: "/images/faces/file46.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [25],
    correctAnswer: ["Полина", 'Полька', 'Степанова', 'Полинчик', "Апполинария"],
  },
  {
    image: "/images/faces/file25.png", // Фотография части тела
    fullImage: "/images/faces/file32.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [26],
    correctAnswer: ["Виктор", 'Витя', "Б.д.к", "Викторио"]
    ,
  },
  {
    image: "/images/faces/file27.png", // Фотография части тела
    fullImage: "/images/faces/file79.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [27],
    correctAnswer: ["Илья", 'Албанец', "Илюша"]
    ,
  },
  {
    image: "/images/faces/file89.png", // Фотография части тела
    fullImage: "/images/faces/file28.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [28],
    correctAnswer: ["Артем", 'Шмаков']
    ,
  },
  {
    image: "/images/faces/file57.png", // Фотография части тела
    fullImage: "/images/faces/file38.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [29],
    correctAnswer: ["Андрей", "Балобан", "а че не так то", "Эндрю"]
    ,
  },
  {
    image: "/images/faces/file60.png", // Фотография части тела
    fullImage: "/images/faces/file61.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [30],
    correctAnswer: ["Таня", 'Бобренок младший', "Танюша", "Танька", "Татьяна"]
    ,
  },
  {
    image: "/images/faces/file73.png", // Фотография части тела
    fullImage: "/images/faces/file24.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [31],
    correctAnswer: ["Данил", 'Денчик', "Яковлев", "Даниил", "Даня"]
    ,
  },
  {
    image: "/images/faces/file84.png", // Фотография части тела
    fullImage: "/images/faces/file29.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [32],
    correctAnswer: ["Даниил", 'Синоптик', 'Даня', 'Данил']
    ,
  },
  {
    image: "/images/faces/file49.png", // Фотография части тела
    fullImage: "/images/faces/file82.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [33],
    correctAnswer: ["Андрей", "Балобан", "а че не так то", "Эндрю"]
    ,
  },
  {
    image: "/images/faces/file66.png", // Фотография части тела
    fullImage: "/images/faces/file56.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [34],
    correctAnswer: ["Веня", 'Веньямин', "Ваня", 'Перекуп']
    ,
  },
  {
    image: "/images/faces/file53.png", // Фотография части тела
    fullImage: "/images/faces/file48.png", // Полная фотография (откуда брали часть)
    parts: ["nose", "eyes", "mouth", "hands", "full"],
    options: [35],
    correctAnswer: ["Веня", 'Веньямин', "Ваня", 'Перекуп']
    ,
  },
  // Добавьте больше вопросов здесь
];
