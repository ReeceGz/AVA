const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./AVA_memory.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS memory (timestamp TEXT, input TEXT, response TEXT)');
});

function saveToMemory(input, response) {
  const now = new Date().toISOString();
  db.run('INSERT INTO memory (timestamp, input, response) VALUES (?, ?, ?)', [now, input, response]);
}

function getRecentMemory(limit = 5, callback) {
  db.all('SELECT * FROM memory ORDER BY timestamp DESC LIMIT ?', [limit], (err, rows) => {
    if (err) return console.error(err);
    callback(rows);
  });
}

module.exports = { saveToMemory, getRecentMemory };
