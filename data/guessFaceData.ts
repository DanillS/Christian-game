// Файл для добавления вопросов раунда "Угадай Лицо"
// Добавьте свои вопросы в массив

export const guessFaceData: any[] = [
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
]

