const crypto = require('node:crypto');

const passwordHash = (password, salt) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) =>
      error ? reject(error) : resolve(key.toString('hex'))
    );
  });

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await passwordHash(password, salt);
  return { salt, hash };
}

async function verifyPassword(password, salt, hash) {
  try {
    const candidate = Buffer.from(await passwordHash(password, salt), 'hex');
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  } catch (err) {
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword
};
