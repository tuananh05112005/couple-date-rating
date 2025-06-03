const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
require('dotenv').config();


app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.use(express.static('src')); // phục vụ index.html và tệp tĩnh

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});


db.connect((err) => {
  if (err) throw err;
  console.log('✅ Đã kết nối MySQL!');
});

// API: Lưu đánh giá
app.post('/api/ratings', (req, res) => {
  const { rating, feeling, photo } = req.body;
  const sql = 'INSERT INTO couple_rating (rating, feeling, photo) VALUES (?, ?, ?)';
  db.query(sql, [rating, feeling, photo], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi lưu đánh giá' });
    } else {
      res.json({ message: 'Đã lưu đánh giá thành công!' });
    }
  });
});

// API: Lấy tất cả đánh giá
app.get('/api/ratings', (req, res) => {
  db.query('SELECT * FROM couple_rating ORDER BY created_at DESC', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.delete('/api/ratings/:id', (req, res) => {
  const sql = 'DELETE FROM couple_rating WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi khi xóa đánh giá' });
    }
    res.json({ message: 'Đánh giá đã được xóa!' });
  });
});


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
