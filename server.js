const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // 👈 thêm path để xử lý đường dẫn
const app = express();

// Cho phép frontend Netlify gọi API
app.use(cors({
  origin: 'https://elaborate-bunny-0b0d090.netlify.app',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// ✅ Phục vụ file tĩnh từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Nếu là SPA (single page app), serve index.html cho mọi route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

// API endpoints
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

app.get('/api/ratings', (req, res) => {
  db.query('SELECT * FROM couple_rating ORDER BY created_at DESC', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
