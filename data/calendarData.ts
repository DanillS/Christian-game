// Файл для добавления вопросов раунда "Календарь"
// Добавьте свои вопросы в массив

export const calendarData: any[] = [
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
]

