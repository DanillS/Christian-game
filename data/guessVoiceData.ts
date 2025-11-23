// Файл для добавления вопросов раунда "Угадай, Кто Говорит"
// Добавьте свои вопросы в соответствующие массивы по уровню сложности
// audioUrl должен указывать на путь к аудиофайлу в папке public

export const guessVoiceData: Record<string, any[]> = {
  easy: [
    {
      audioUrl: '/audio/voices/voice1.mp3', // Замените на путь к вашему аудиофайлу
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Иван',
    },
    {
      audioUrl: '/audio/voices/voice2.mp3',
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Мария',
    },
    // Добавьте больше вопросов здесь
  ],
  medium: [
    {
      audioUrl: '/audio/voices/voice3.mp3',
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Петр',
    },
    // Добавьте больше вопросов здесь
  ],
  hard: [
    {
      audioUrl: '/audio/voices/voice4.mp3',
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Анна',
    },
    // Добавьте больше вопросов здесь
  ],
}

