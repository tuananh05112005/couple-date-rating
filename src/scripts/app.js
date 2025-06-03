// URL API backend để gửi/nhận dữ liệu đánh giá
const API_URL = 'https://couple-date-rating-2.onrender.com'; // Đổi sang domain backend khi deploy

// Lấy các element DOM cần thiết
const emojis = document.querySelectorAll('.emoji'); // Các emoji để đánh giá (1-5 sao)
const message = document.getElementById('message'); // Thông báo phản hồi
const feelings = document.getElementById('feelings'); // Textarea nhập cảm xúc
const meterFill = document.getElementById('meterFill'); // Thanh tiến trình love meter
const photoUpload = document.getElementById('photoUpload'); // Input upload ảnh
const photoPreview = document.getElementById('photoPreview'); // Preview ảnh đã upload
const memorySection = document.getElementById('memorySection'); // Section hiển thị kỷ niệm
const memories = document.getElementById('memories'); // Container chứa các kỷ niệm

// Mảng thông báo tương ứng với từng mức đánh giá (1-5 sao)
const messages = [
  "Ơ kìa, không vui lắm à? 😐 Lần sau sẽ tốt hơn thôi! 💪", // 1 sao
  "Cũng vui vui đấy nhỉ! 😊 Có gì không hài lòng không? 🤔", // 2 sao
  "Ôi zồi ôi đáng yêu ghê 🥰 💕", // 3 sao
  "Quá đỉnh luôn á 😍 Em giỏi quá! 🌟", // 4 sao
  "Em yêu anh nhìu lắm 💖💖💖 Perfect date! ✨🎉" // 5 sao
];

// Mảng thông báo đặc biệt (hiển thị ngẫu nhiên thay cho messages thường)
const specialMessages = [
  "Hmm... có lẽ chúng ta cần thử gì đó mới? 🤗", // 1 sao
  "Không sao, mỗi ngày bên nhau đều đáng trân trọng! 💐", // 2 sao
  "Aww, tim em tan chảy rồi đây! 🫠💕", // 3 sao
  "Wao! Hôm nay là ngày tuyệt vời nhất! 🌈✨", // 4 sao
  "OMG! Couple goals quá đi thôi! 👑💖💫" // 5 sao
];

let currentRating = 0; // Biến lưu đánh giá hiện tại

// Hàm tạo trái tim bay lên (hiệu ứng nền)
function createFloatingHeart() {
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  // Chọn ngẫu nhiên 1 trong 5 loại trái tim
  heart.textContent = ['💖', '💕', '💝', '💗', '💓'][Math.floor(Math.random() * 5)];
  heart.style.left = Math.random() * 100 + '%'; // Vị trí ngang ngẫu nhiên
  heart.style.animationDuration = (Math.random() * 10 + 10) + 's'; // Thời gian bay 10-20s
  heart.style.animationDelay = Math.random() * 5 + 's'; // Delay ngẫu nhiên 0-5s
  document.getElementById('floatingHearts').appendChild(heart);
  setTimeout(() => heart.remove(), 20000); // Xóa sau 20s
}
// Tạo trái tim bay mỗi 3 giây
setInterval(createFloatingHeart, 3000);

// Xử lý sự kiện click vào emoji đánh giá
emojis.forEach((emoji, index) => {
  emoji.addEventListener('click', () => {
    // Bỏ class selected khỏi tất cả emoji
    emojis.forEach(e => e.classList.remove('selected'));
    // Thêm class selected vào emoji được click
    emoji.classList.add('selected');
    currentRating = index + 1; // Lưu đánh giá (1-5)

    // Tạo hiệu ứng trái tim bay ra từ emoji được click
    for(let i = 0; i < 5; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.textContent = ['💗', '💖', '💕', '💝', '💓'][i];
        document.body.appendChild(heart);
        heart.style.position = 'fixed';
        // Vị trí xuất hiện gần emoji được click
        heart.style.left = (emoji.getBoundingClientRect().left + Math.random() * 40 - 20) + 'px';
        heart.style.top = (emoji.getBoundingClientRect().top - 20) + 'px';
        heart.style.zIndex = '1000';
        setTimeout(() => heart.remove(), 2000); // Xóa sau 2s
      }, i * 100); // Delay mỗi trái tim 100ms
    }

    // Chọn ngẫu nhiên giữa message thường và special message
    const isSpecial = Math.random() > 0.5;
    message.textContent = isSpecial ? specialMessages[index] : messages[index];
    
    // Cập nhật thanh love meter (mỗi sao = 20%)
    meterFill.style.width = (currentRating * 20) + '%';

    // Xử lý ảnh đã upload (nếu có)
    const file = photoUpload.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const photoBase64 = e.target.result;
        // Code gửi dữ liệu đã bị comment
        // sendRating(currentRating, feelings.value, photoBase64);
      };
      reader.readAsDataURL(file);
    } else {
      // Gửi mà không có ảnh
      // sendRating(currentRating, feelings.value, null);
    }

    // Nếu đánh giá >= 4 sao thì tạo hiệu ứng confetti
    if(currentRating >= 4) {
      createConfetti();
    }
  });
});

// Hàm gửi đánh giá lên server (hiện tại đã bị comment)
function sendRating(rating, feeling, photo) {
  fetch(`${API_URL}/api/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, feeling, photo })
  })
  .then(res => res.json())
  .then(data => {
    alert('🎉 Đã gửi lời nhắn đến tình yêu của bạn!');
    message.textContent = '💌 Gửi thành công! Tình yêu đã được lưu lại mãi mãi!';
    createConfetti();
    clearForm();
    updateStatsFromServer();
  })
  .catch(err => {
    console.error(err);
    alert('Gửi không thành công 😢');
  });
}

// Xử lý sự kiện upload ảnh
photoUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      // Hiển thị preview ảnh
      photoPreview.innerHTML = `<img src="${e.target.result}" class="photo-preview" alt="Date photo">`;
      // Nếu đã có đánh giá thì thêm vào memory
      if(currentRating > 0) {
        addMemory(currentRating, feelings.value, e.target.result);
      }
    };
    reader.readAsDataURL(file); // Đọc file thành base64
  }
});

// Cập nhật thống kê từ server
function updateStatsFromServer() {
  fetch(`${API_URL}/api/ratings`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const totalRatings = data.length; // Tổng số đánh giá
      // Tính điểm trung bình
      const avgRating = totalRatings > 0 ? (data.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1) : 0;
      // Tính love score (tối thiểu 50, tối đa 100)
      const loveScore = Math.min(100, Math.max(50, avgRating * 20));

      // Cập nhật UI
      document.getElementById('totalRatings').textContent = totalRatings;
      document.getElementById('avgRating').textContent = avgRating;
      document.getElementById('loveScore').textContent = Math.round(loveScore);
    })
    .catch(err => console.error('Lỗi thống kê:', err.message));
}

// Thêm kỷ niệm mới vào localStorage
function addMemory(rating, feeling, photo) {
  const memory = {
    id: Date.now(), // ID duy nhất dựa trên timestamp
    rating, feeling, photo,
    // Lưu ngày giờ hiện tại theo timezone Việt Nam
    date: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
  };
  // Lấy danh sách kỷ niệm đã lưu
  let savedMemories = JSON.parse(localStorage.getItem('dateMemories') || '[]');
  // Thêm kỷ niệm mới vào đầu danh sách
  savedMemories.unshift(memory);
  // Lưu lại vào localStorage
  localStorage.setItem('dateMemories', JSON.stringify(savedMemories));
  displayMemories(); // Hiển thị lại danh sách
  memorySection.style.display = 'block'; // Hiện section kỷ niệm
}

// Hiển thị danh sách kỷ niệm
function displayMemories() {
  const savedMemories = JSON.parse(localStorage.getItem('dateMemories') || '[]');
  memories.innerHTML = ''; // Xóa nội dung cũ

  // Lấy ngày hôm nay
  const today = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  // Chỉ hiển thị 3 kỷ niệm gần nhất
  savedMemories.slice(0, 3).forEach(memory => {
    const memoryDiv = document.createElement('div');
    memoryDiv.className = 'memory-item';
    memoryDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-weight: bold; color: #ff4081;">${today}</span>
        <span>${'⭐'.repeat(memory.rating)}</span>
      </div>
      ${memory.photo ? `<img src="${memory.photo}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">` : ''}
      <p style="margin: 0; font-style: italic; color: #666;">"${memory.feeling}"</p>
    `;
    memories.appendChild(memoryDiv);
  });
}

// Tạo hiệu ứng confetti (giấy vụn bay)
function createConfetti() {
  const confettiCount = 30; // Số lượng confetti
  const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1', '#ff91a4']; // Màu sắc hồng
  
  for(let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + '%'; // Vị trí ngang ngẫu nhiên
      confetti.style.top = '-10px'; // Bắt đầu từ trên cùng
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)'; // Xoay ngẫu nhiên
      confetti.style.animation = 'floatUp 3s ease-out forwards'; // Animation rơi xuống
      confetti.style.zIndex = '1001';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000); // Xóa sau 3s
    }, i * 50); // Delay mỗi confetti 50ms
  }
}

// Khởi tạo: hiển thị kỷ niệm đã lưu
displayMemories();
// Nếu có kỷ niệm thì hiện section
if(JSON.parse(localStorage.getItem('dateMemories') || '[]').length > 0) {
  memorySection.style.display = 'block';
}

// Tạo trái tim khi gõ từ "yêu" hoặc "love"
feelings.addEventListener('input', () => {
  if(feelings.value.includes('yêu') || feelings.value.includes('love')) {
    createFloatingHeart();
  }
});

// Easter egg: Konami Code
let konamiCode = []; // Mảng lưu phím đã nhấn
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.code); // Thêm phím vừa nhấn
  // Chỉ giữ lại số phím bằng độ dài sequence
  if(konamiCode.length > konamiSequence.length) konamiCode.shift();
  
  // Kiểm tra có khớp Konami Code không
  if(JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
    message.textContent = "🎉 CHEAT CODE ACTIVATED! Unlimited love! 💖∞";
    document.getElementById('loveScore').textContent = '∞'; // Love score vô hạn
    createConfetti();
    konamiCode = []; // Reset
  }
});