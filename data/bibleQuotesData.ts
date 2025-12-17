// Файл для добавления вопросов раунда "Библейские Цитаты"
// Формат: question (текст вопроса), correctAnswers (массив правильных ответов)

export interface BibleQuoteQuestion {
  question: string;
  correctAnswers: string[];
}

export const bibleQuotesData: BibleQuoteQuestion[] = [
  {
    question:
      'Откуда цитата: "Ибо так возлюбил Бог мир, что отдал Сына Своего Единородного"?',
    correctAnswers: ["Иоанна 3:16", "Ин 3:16", "Иоанн 3:16"],
  },
  {
    question: 'Продолжите: "Господь - Пастырь мой; ..."',
    correctAnswers: [
      "я ни в чем не буду нуждаться",
      "ни в чем не буду нуждаться",
    ],
  },
  // Добавьте больше вопросов здесь
];
