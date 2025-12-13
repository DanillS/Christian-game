// Файл для добавления вопросов раунда "Угадай, Кто Говорит"
// Добавьте свои вопросы в массив
// audioUrl должен указывать на путь к аудиофайлу в папке public

export const guessVoiceData: any[] = [
  {
    audioUrl: "/audio/voices/file1.mp3", // Замените на путь к вашему аудиофайлу
    options: ["Иван1", "Мария1", "Петр1", "Анна1"],
    correctAnswer: "Иван1",
  },
  {
    audioUrl: "/audio/voices/file3.mp3", // file2.mp3 отсутствует, используем file3.mp3
    options: ["Иван2", "Мария2", "Петр2", "Анна2"],
    correctAnswer: "Мария2",
  },
  {
    audioUrl: "/audio/voices/file4.mp3",
    options: ["Иван", "Мария", "Петр", "Анна"],
    correctAnswer: "Мария",
  },
  {
    audioUrl: "/audio/voices/file5.mp3",
    options: ["Иван", "Мария", "Петр", "Анна"],
    correctAnswer: "Мария",
  },
  {
    audioUrl: "/audio/voices/file6.mp3",
    options: ["Иван", "Мария", "Петр", "Анна"],
    correctAnswer: "Мария",
  },
  {
    audioUrl: "/audio/voices/file7.mp3",
    options: ["Иван", "Мария", "Петр", "Анна"],
    correctAnswer: "Мария",
  },
  {
    audioUrl: "/audio/voices/file8.mp3",
    options: ["Иван", "Мария", "Петр", "Анна"],
    correctAnswer: "Мария",
  },
  {
    audioUrl: "/audio/voices/file9.mp3",
    options: ["Иван", "Мария", "Петр", "Анна"],
    correctAnswer: "Мария",
  },
  // Добавьте больше вопросов здесь
];
