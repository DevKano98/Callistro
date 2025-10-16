const csv = require('csv-parser');
const fs = require('fs');
const { Readable } = require('stream');

async function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer);
    stream
      .pipe(csv())
      .on('data', (data) => {
        if (data.phone || data.phoneNumber) {
          results.push(data.phone || data.phoneNumber);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

module.exports = { parseCSV };