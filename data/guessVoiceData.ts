// Файл для добавления вопросов раунда "Угадай, Кто Говорит"
// Добавьте свои вопросы в массив
// audioUrl должен указывать на путь к аудиофайлу с неестественным голосом
// originalAudioUrl (опционально) - путь к оригинальному голосу/видео, который будет воспроизводиться после правильного ответа
//
// Примеры:
// - Аудио: file1.mp3 (неестественный) и file1_original.mp3 (оригинал)
// - Видео: file1.mp3 (неестественный) и file1_original.mp4 (оригинальное видео)
//
// Поддерживаемые форматы видео: .mp4, .webm, .mov, .avi
//
// Поддерживаются несколько форматов для правильных ответов:
// 1. correctAnswers: ["Даша", "Дашенька"] - массив (рекомендуется)
// 2. correctAnswer: "Даша | Дашенька" - строка через " | "
// 3. correctAnswer: "Даша" - одна строка

export const guessVoiceData: any[] = [
  {
    audioUrl: "/audio/voices/file1.mp3",
    originalAudioUrl: "/audio/voices/file1_original.mp4", // Добавьте оригинальный файл
    options: ["Таня", "Даша", "Юля", "Витя"],
    correctAnswer: ["Даша", 'Дарья', 'Дашуля', 'Мазда 6', 'Дашка']
    , // Или используйте correctAnswers: ["Даша", "Дашенька"]
  },
  {
    audioUrl: "/audio/voices/file3.mp3",
    originalAudioUrl: "/audio/voices/file3_original.mp3", // Добавьте оригинальный файл
    options: ["Маша", "Полина", "Петя", "Веня", "Дина", "Илья"],
    correctAnswer: ["Дина", 'Бобренок старший', "Динчик", "Диночка"]
    ,
  },
  {
    audioUrl: "/audio/voices/file4.mp3",
    originalAudioUrl: "/audio/voices/file4_original.mp4", // Добавьте оригинальный файл
    options: ["Данил Я", "Витя", "Лена", "Яна", "Филипп"],
    correctAnswer: ["Данил", 'Денчик', "Яковлев", "Даниил", "Даня"]
    ,
  },
  {
    audioUrl: "/audio/voices/file5.mp3",
    originalAudioUrl: "/audio/voices/file5_original.mp3", // Добавьте оригинальный файл
    options: ["Витя", "Данил Я", "Тима", "Аня", "Филипп"],
    correctAnswer: ["Тима", 'Тимофей', 'Черныш', 'Албанстрой', 'Тимоша', "Тимоха"]
    ,
  },
  {
    audioUrl: "/audio/voices/file6.mp3",
    originalAudioUrl: "/audio/voices/file6_original.mp4", // Добавьте оригинальный файл
    options: ["Иван", "Мария", "Петя", "Маша", "Лиза Б", "Витя"],
    correctAnswer: ["Виктор", 'Витя', "Б.д.к", "Викторио"]
    ,
  },
  {
    audioUrl: "/audio/voices/file7.mp3",
    originalAudioUrl: "/audio/voices/file7_original.mp3", // Добавьте оригинальный файл
    options: ["Филипп", "Мария", "Маша", "Оля", "Лиза Б", "Данил Я"],
    correctAnswer: ["Филипп", 'Филя', 'Филка', 'Филип', 'Фелип']
    ,
  },
  {
    audioUrl: "/audio/voices/file8.mp3",
    originalAudioUrl: "/audio/voices/file8_original.mp3", // Добавьте оригинальный файл
    options: ['dsf'],
    correctAnswer: "Маша",
  },
  {
    audioUrl: "/audio/voices/file9.mp3",
    originalAudioUrl: "/audio/voices/file9_original.mp3", // Добавьте оригинальный файл
    options: ["Коля", "Филипп", "Руфа", "Данил Я", "Лиза Б"],
    correctAnswer: ["Елизавета", 'не крутите мяч пж', 'Лизонька', 'Элиза', 'Лиз', 'Лиза']
    ,
  },
  {
    audioUrl: "/audio/voices/file10.mp3",
    originalAudioUrl: "/audio/voices/file10_original.mp4", // Добавьте оригинальный файл
    options: ["Руфа", "Филипп", "Сашка", "Данил Я", "Лиза Б"],
    correctAnswer: ["Александр 1-й", 'Саня', 'Владелец', 'Нина...', 'Санчес', "Саша", 'Александр', "Степанов"]
    ,
  },
  // Добавьте больше вопросов здесь
];
