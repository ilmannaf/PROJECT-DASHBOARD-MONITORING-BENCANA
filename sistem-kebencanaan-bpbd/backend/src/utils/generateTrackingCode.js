function generateTrackingCode() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit acak
  return `BPBD-${year}-${random}`;
}

module.exports = generateTrackingCode;