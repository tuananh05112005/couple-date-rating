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

// // API: Lấy tất cả đánh giá
// app.get('/api/ratings', (req, res) => {
//   db.query('SELECT * FROM couple_rating ORDER BY created_at DESC', (err, results) => {
//     if (err) throw err;
//     res.json(results);
//   });
// });

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

app.put('/api/ratings/:id/favorite', (req, res) => {
  const id = req.params.id;
  const { is_favorite } = req.body;

  db.query(
    'UPDATE couple_rating SET is_favorite = ? WHERE id = ?',
    [is_favorite, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi khi cập nhật yêu thích' });
      }
      res.json({ message: 'Cập nhật thành công' });
    }
  );
});

 
// Backend - ratings route (e.g., routes/ratings.js or server.js)
app.get('/api/ratings', (req, res) => {
  const order = req.query.order === 'asc' ? 'ASC' : 'DESC';
  const star = parseInt(req.query.star);
  const favorite = req.query.favorite === 'true';

  let sql = "SELECT * FROM couple_rating";
  const params = [];
  const conditions = [];

  if (!isNaN(star)) {
    conditions.push("rating = ?");
    params.push(star);
  }

  if (favorite) {
    conditions.push("is_favorite = true");
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += ` ORDER BY created_at ${order}`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
    res.json(results);
  });
});

process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Rejection:", reason);
});


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
