const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error('Invalid date');
    error.statusCode = 400;
    throw error;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfNextDay = (value = new Date()) => {
  const date = startOfDay(value);
  date.setDate(date.getDate() + 1);
  return date;
};

module.exports = {
  startOfDay,
  startOfNextDay,
};
