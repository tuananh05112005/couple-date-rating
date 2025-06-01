const API_URL = 'https://couple-date-rating-1.onrender.com'; // Đổi sang domain backend khi deploy

const emojis = document.querySelectorAll('.emoji');
const message = document.getElementById('message');
const feelings = document.getElementById('feelings');
const meterFill = document.getElementById('meterFill');
const photoUpload = document.getElementById('photoUpload');
const photoPreview = document.getElementById('photoPreview');
const memorySection = document.getElementById('memorySection');
const memories = document.getElementById('memories');

const messages = [
  "Ơ kìa, không vui lắm à? 😐 Lần sau sẽ tốt hơn thôi! 💪",
  "Cũng vui vui đấy nhỉ! 😊 Có gì không hài lòng không? 🤔",
  "Ôi zồi ôi đáng yêu ghê 🥰 Em thích nhất là gì? 💕",
  "Quá đỉnh luôn á 😍 Anh/Em giỏi quá! 🌟",
  "Em yêu anh nhìu lắm 💖💖💖 Perfect date! ✨🎉"
];

const specialMessages = [
  "Hmm... có lẽ chúng ta cần thử gì đó mới? 🤗",
  "Không sao, mỗi ngày bên nhau đều đáng trân trọng! 💐",
  "Aww, tim anh/em tan chảy rồi đây! 🫠💕",
  "Wao! Hôm nay là ngày tuyệt vời nhất! 🌈✨",
  "OMG! Couple goals quá đi thôi! 👑💖💫"
];

let currentRating = 0;

function createFloatingHeart() {
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.textContent = ['💖', '💕', '💝', '💗', '💓'][Math.floor(Math.random() * 5)];
  heart.style.left = Math.random() * 100 + '%';
  heart.style.animationDuration = (Math.random() * 10 + 10) + 's';
  heart.style.animationDelay = Math.random() * 5 + 's';
  document.getElementById('floatingHearts').appendChild(heart);
  setTimeout(() => heart.remove(), 20000);
}
setInterval(createFloatingHeart, 3000);

emojis.forEach((emoji, index) => {
  emoji.addEventListener('click', () => {
    emojis.forEach(e => e.classList.remove('selected'));
    emoji.classList.add('selected');
    currentRating = index + 1;

    for(let i = 0; i < 5; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.textContent = ['💗', '💖', '💕', '💝', '💓'][i];
        document.body.appendChild(heart);
        heart.style.position = 'fixed';
        heart.style.left = (emoji.getBoundingClientRect().left + Math.random() * 40 - 20) + 'px';
        heart.style.top = (emoji.getBoundingClientRect().top - 20) + 'px';
        heart.style.zIndex = '1000';
        setTimeout(() => heart.remove(), 2000);
      }, i * 100);
    }

    const isSpecial = Math.random() > 0.5;
    message.textContent = isSpecial ? specialMessages[index] : messages[index];
    meterFill.style.width = (currentRating * 20) + '%';

    const file = photoUpload.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const photoBase64 = e.target.result;
        sendRating(currentRating, feelings.value, photoBase64);
      };
      reader.readAsDataURL(file);
    } else {
      sendRating(currentRating, feelings.value, null);
    }

    if(currentRating >= 4) {
      createConfetti();
    }
  });
});

function sendRating(rating, feeling, photo) {
  fetch(`${API_URL}/api/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, feeling, photo })
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('Server response:', data);
    updateStatsFromServer();
  })
  .catch(err => console.error('Fetch lỗi:', err.message));
}

photoUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      photoPreview.innerHTML = `<img src="${e.target.result}" class="photo-preview" alt="Date photo">`;
      if(currentRating > 0) {
        addMemory(currentRating, feelings.value, e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }
});

function updateStatsFromServer() {
  fetch(`${API_URL}/api/ratings`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const totalRatings = data.length;
      const avgRating = totalRatings > 0 ? (data.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1) : 0;
      const loveScore = Math.min(100, Math.max(50, avgRating * 20));

      document.getElementById('totalRatings').textContent = totalRatings;
      document.getElementById('avgRating').textContent = avgRating;
      document.getElementById('loveScore').textContent = Math.round(loveScore);
    })
    .catch(err => console.error('Lỗi thống kê:', err.message));
}

function addMemory(rating, feeling, photo) {
  const memory = {
    id: Date.now(),
    rating, feeling, photo,
    date: new Date().toLocaleDateString('vi-VN')
  };
  let savedMemories = JSON.parse(localStorage.getItem('dateMemories') || '[]');
  savedMemories.unshift(memory);
  localStorage.setItem('dateMemories', JSON.stringify(savedMemories));
  displayMemories();
  memorySection.style.display = 'block';
}

function displayMemories() {
  const savedMemories = JSON.parse(localStorage.getItem('dateMemories') || '[]');
  memories.innerHTML = '';
  savedMemories.slice(0, 3).forEach(memory => {
    const memoryDiv = document.createElement('div');
    memoryDiv.className = 'memory-item';
    memoryDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-weight: bold; color: #ff4081;">${memory.date}</span>
        <span>${'⭐'.repeat(memory.rating)}</span>
      </div>
      ${memory.photo ? `<img src="${memory.photo}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">` : ''}
      <p style="margin: 0; font-style: italic; color: #666;">"${memory.feeling}"</p>
    `;
    memories.appendChild(memoryDiv);
  });
}

function createConfetti() {
  const confettiCount = 30;
  const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1', '#ff91a4'];
  for(let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      confetti.style.animation = 'floatUp 3s ease-out forwards';
      confetti.style.zIndex = '1001';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }, i * 50);
  }
}

displayMemories();
if(JSON.parse(localStorage.getItem('dateMemories') || '[]').length > 0) {
  memorySection.style.display = 'block';
}

feelings.addEventListener('input', () => {
  if(feelings.value.includes('yêu') || feelings.value.includes('love')) {
    createFloatingHeart();
  }
});

let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
document.addEventListener('keydown', (e) => {
  konamiCode.push(e.code);
  if(konamiCode.length > konamiSequence.length) konamiCode.shift();
  if(JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
    message.textContent = "🎉 CHEAT CODE ACTIVATED! Unlimited love! 💖∞";
    document.getElementById('loveScore').textContent = '∞';
    createConfetti();
    konamiCode = [];
  }
});
