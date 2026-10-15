const crypto = require('crypto');

function generateTrackingCode() {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `BPBD-${year}-${random}`;
}

module.exports = generateTrackingCode;