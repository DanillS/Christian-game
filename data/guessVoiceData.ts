// Файл для добавления вопросов раунда "Угадай, Кто Говорит"
// Добавьте свои вопросы в массив
// audioUrl должен указывать на путь к аудиофайлу в папке public

export const guessVoiceData: any[] = [
  {
    audioUrl: '/audio/melodies/v_020.mp3', // Замените на путь к вашему аудиофайлу
    options: ['Иван', 'Мария', 'Петр', 'Анна'],
    correctAnswer: 'Иван',
  },
  {
    audioUrl: '/audio/voices/voice2.mp3',
    options: ['Иван', 'Мария', 'Петр', 'Анна'],
    correctAnswer: 'Мария',
  },
  // Добавьте больше вопросов здесь
]

