// Файл для добавления вопросов раунда "Календарь"
// Добавьте свои вопросы в соответствующие массивы по уровню сложности

export const calendarData: Record<string, any[]> = {
  easy: [
    {
      questionType: 'date', // 'date' - угадать дату по фото, 'birthday' - угадать день рождения по дате
      image: '/images/calendar/photo1.jpg', // Замените на путь к вашей фотографии (PNG, JPG, JPEG)
      options: ['1 января', '7 января', '14 января', '25 декабря'],
      correctAnswer: '7 января',
    },
    {
      questionType: 'birthday',
      date: '25 декабря',
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Иван',
    },
    // Добавьте больше вопросов здесь
  ],
  medium: [
    {
      questionType: 'date',
      image: '/images/calendar/photo2.jpg',
      options: ['1 января', '7 января', '14 января', '25 декабря'],
      correctAnswer: '14 января',
    },
    {
      questionType: 'birthday',
      date: '7 января',
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Мария',
    },
    // Добавьте больше вопросов здесь
  ],
  hard: [
    {
      questionType: 'date',
      image: '/images/calendar/photo3.jpg',
      options: ['1 января', '7 января', '14 января', '25 декабря'],
      correctAnswer: '25 декабря',
    },
    {
      questionType: 'birthday',
      date: '1 января',
      options: ['Иван', 'Мария', 'Петр', 'Анна'],
      correctAnswer: 'Петр',
    },
    // Добавьте больше вопросов здесь
  ],
}

