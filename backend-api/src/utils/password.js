const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const ALL = LOWER + UPPER + DIGITS;

const randomChar = (charset) => charset[crypto.randomInt(0, charset.length)];

const generatePassword = (length = 8) => {
  if (length < 3) {
    throw new Error('Password length must be at least 3');
  }

  const chars = [randomChar(LOWER), randomChar(UPPER), randomChar(DIGITS)];

  while (chars.length < length) {
    chars.push(randomChar(ALL));
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = {
  generatePassword,
  hashPassword,
  comparePassword,
};
