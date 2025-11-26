// Файл для добавления вопросов раунда "Угадай Лицо"
// Добавьте свои вопросы в соответствующие массивы по уровню сложности

export const guessFaceData: Record<string, any[]> = {
  easy: [
    {
      image: '/images/faces/person1.jpg', // Замените на путь к вашей фотографии (PNG, JPG, JPEG)
      parts: ['nose', 'eyes', 'mouth', 'hands', 'full'],
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Иван',
    },
    {
      image: '/images/faces/person2.jpg',
      parts: ['nose', 'eyes', 'mouth', 'hands', 'full'],
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Мария',
    },
    // Добавьте больше вопросов здесь
  ],
  medium: [
    {
      image: '/images/faces/person3.jpg',
      parts: ['nose', 'eyes', 'mouth', 'hands', 'full'],
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Петр',
    },
    // Добавьте больше вопросов здесь
  ],
  hard: [
    {
      image: '/images/faces/person4.jpg',
      parts: ['nose', 'eyes', 'mouth', 'hands', 'full'],
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Анна',
    },
    // Добавьте больше вопросов здесь
  ],
}

