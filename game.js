// Oyun Değişkenleri
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelDisplay = document.getElementById('level-display');

// Oyun Durumu
let gameRunning = true;
let level = 1;
let playerHealth = 100;
let enemyHealth = 100;
let playerScore = 0;
let playerDeathCount = 0;
let questionsAnswered = 0;
let currentQuestions = [];
let currentQuestionIndex = 0;

// Fizik Değişkenleri
const gravity = 0.5;
const groundY = 350;

// Karakter Pozisyonları
let player = {
    x: 650,
    y: groundY - 64,
    width: 50,
    height: 64,
    vx: 0,
    vy: 0,
    isJumping: false,
    isAttacking: false,
    direction: 'left',
    state: 'idle',
    frame: 0,
    lastFrameTime: 0
};

let enemy = {
    x: 100,
    y: groundY - 64,
    width: 50,
    height: 64,
    vx: 0,
    vy: 0,
    isAttacking: false,
    direction: 'right',
    state: 'idle',
    frame: 0,
    lastFrameTime: 0,
    speed: 1 + (level * 0.2)
};

// Tile Haritası (Zemin)
const tileSize = 32;
const groundTiles = [];
for (let i = 0; i < 25; i++) {
    groundTiles.push({
        x: i * tileSize,
        y: groundY,
        type: Math.floor(Math.random() * 16) + 1
    });
}

// Süs objeleri
const decorations = [
    { x: 200, y: groundY - 16, type: 'bush' },
    { x: 400, y: groundY - 16, type: 'mushroom' },
    { x: 600, y: groundY - 16, type: 'stone' },
    { x: 300, y: groundY - 32, type: 'tree' }
];

// Matematik Soruları (Seviyeli)
const questionsByLevel = {
    1: [
        { question: "3 kg elma 18 TL ise 5 kg elma kaç TL'dir?", options: ["25 TL", "30 TL", "35 TL", "40 TL"], correct: 1 },
        { question: "4 defter 20 TL ise 7 defter kaç TL'dir?", options: ["30 TL", "35 TL", "40 TL", "45 TL"], correct: 1 },
        { question: "2 saatte 120 km giden araç, 5 saatte kaç km gider?", options: ["240 km", "300 km", "360 km", "400 km"], correct: 1 },
        { question: "5 kg portakal 25 TL ise 8 kg portakal kaç TL'dir?", options: ["35 TL", "40 TL", "45 TL", "50 TL"], correct: 1 },
        { question: "3 günde 15 sayfa okuyan biri, 7 günde kaç sayfa okur?", options: ["30 sayfa", "35 sayfa", "40 sayfa", "45 sayfa"], correct: 1 }
    ],
    2: [
        { question: "Bir araç 80 km/s hızla 6 saatte gidiyor. Aynı yolu 120 km/s hızla kaç saatte gider? (Ters Orantı)", options: ["3 saat", "4 saat", "5 saat", "6 saat"], correct: 1 },
        { question: "8 işçi bir işi 15 günde bitiriyor. Aynı işi 12 işçi kaç günde bitirir? (Ters Orantı)", options: ["8 gün", "10 gün", "12 gün", "15 gün"], correct: 1 },
        { question: "3 musluk havuzu 12 saatte dolduruyor. 4 musluk kaç saatte doldurur? (Ters Orantı)", options: ["6 saat", "8 saat", "9 saat", "10 saat"], correct: 2 },
        { question: "Bir kumaşın 3/5'i 60 metre ise tamamı kaç metredir?", options: ["80 m", "90 m", "100 m", "120 m"], correct: 2 },
        { question: "2/3'ü 40 litre olan su deposu kaç litre alır?", options: ["50 L", "60 L", "70 L", "80 L"], correct: 1 }
    ],
    3: [
        { question: "3 usta 4 günde 12 masa yapıyorsa, 5 usta 6 günde kaç masa yapar?", options: ["24 masa", "30 masa", "36 masa", "40 masa"], correct: 1 },
        { question: "Bir işi 4 işçi 9 günde bitiriyor. Aynı işi 6 işçi kaç günde bitirir? (Ters Orantı)", options: ["4 gün", "5 gün", "6 gün", "7 gün"], correct: 2 },
        { question: "Bir araç 90 km/s hızla 8 saatte gidiyor. Hızı 120 km/s olsaydı kaç saatte giderdi? (Ters Orantı)", options: ["4 saat", "5 saat", "6 saat", "7 saat"], correct: 2 },
        { question: "3/4'ü 60 TL olan paranın tamamı kaç TL'dir?", options: ["70 TL", "80 TL", "90 TL", "100 TL"], correct: 1 },
        { question: "Bir sınıfta kızların sayısı erkeklerin sayısına oranı 3/5'tir. Kızlar 12 ise erkekler kaçtır?", options: ["15", "18", "20", "24"], correct: 2 }
    ],
    4: [
        { question: "8 kg yaş üzüm kuruyunca 5 kg geliyor. 120 kg yaş üzümden kaç kg kuru üzüm elde edilir?", options: ["60 kg", "65 kg", "70 kg", "75 kg"], correct: 3 },
        { question: "Bir işi 3 işçi 12 günde yapıyor. İş 6 günde bitsin isteniyor. Kaç işçi daha alınmalı? (Ters Orantı)", options: ["2 işçi", "3 işçi", "4 işçi", "5 işçi"], correct: 1 },
        { question: "A sayısı B sayısı ile doğru, C ile ters orantılıdır. A=12 iken B=4, C=3 ise A=24, B=6 iken C kaçtır?", options: ["2", "3", "4", "6"], correct: 1 },
        { question: "Bir haritada 3 cm gerçekte 15 km'yi gösteriyor. Bu haritada 7 cm kaç km'yi gösterir?", options: ["25 km", "30 km", "35 km", "40 km"], correct: 2 },
        { question: "2/5'i 30 kg olan çuvalın 3/4'ü kaç kg'dır?", options: ["45 kg", "50 kg", "56.25 kg", "60 kg"], correct: 2 }
    ]
};

// Klavye kontrolleri
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Saldırı (A tuşu)
    if (e.key === 'a' || e.key === 'A') {
        player.isAttacking = true;
        player.state = 'attack';
        player.frame = 0;
        
        // Saldırı çarpışması
        if (Math.abs(player.x - enemy.x) < 70) {
            enemyHealth -= 10;
            enemy.state = 'hurt';
            enemy.frame = 0;
        }
    }
    
    // Zıplama (Z tuşu)
    if (e.key === 'z' || e.key === 'Z') {
        if (!player.isJumping && player.y >= groundY - 64) {
            player.vy = -12;
            player.isJumping = true;
            player.state = 'jump';
            player.frame = 0;
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.key === 'a' || e.key === 'A') {
        player.isAttacking = false;
        player.state = 'idle';
    }
});

// Oyun döngüsü
function update() {
    if (!gameRunning) return;
    
    // Oyuncu hareketi (Solda, sağa doğru hareket ediyor)
    if (keys['ArrowLeft']) {
        player.vx = -3;
        player.direction = 'left';
        if (!player.isJumping && !player.isAttacking) player.state = 'walk';
    } else if (keys['ArrowRight']) {
        player.vx = 3;
        player.direction = 'right';
        if (!player.isJumping && !player.isAttacking) player.state = 'walk';
    } else {
        player.vx = 0;
        if (!player.isJumping && !player.isAttacking) player.state = 'idle';
    }
    
    // Düşman yapay zekası (Sağda, sola doğru hareket ediyor)
    if (enemyHealth > 0) {
        if (Math.abs(enemy.x - player.x) > 100) {
            enemy.vx = -enemy.speed;
            enemy.state = 'walk';
        } else {
            enemy.vx = 0;
            if (!enemy.isAttacking) {
                enemy.isAttacking = true;
                enemy.state = 'attack';
                enemy.frame = 0;
                
                // Düşman saldırısı
                if (Math.abs(enemy.x - player.x) < 70 && !player.isAttacking) {
                    playerHealth -= 5;
                    if (playerHealth <= 0) {
                        playerDie();
                    }
                }
            }
        }
    }
    
    // Fizik
    player.x += player.vx;
    player.y += player.vy;
    enemy.x += enemy.vx;
    
    // Yer çekimi
    player.vy += gravity;
    enemy.vy += gravity;
    
    // Zemin kontrolü
    if (player.y > groundY - 64) {
        player.y = groundY - 64;
        player.vy = 0;
        player.isJumping = false;
    }
    
    if (enemy.y > groundY - 64) {
        enemy.y = groundY - 64;
        enemy.vy = 0;
    }
    
    // Düşman öldü mü?
    if (enemyHealth <= 0) {
        playerScore += 100;
        level++;
        levelDisplay.textContent = level;
        enemy.speed = 1 + (level * 0.2);
        enemyHealth = 100;
        showLevelUp();
    }
}

function draw() {
    // Arkaplan
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // BG.png yazısı (gerçek asset yoksa placeholder)
    ctx.fillStyle = '#4a4a6e';
    ctx.font = '20px Arial';
    ctx.fillText('BG.png', 350, 100);
    
    // Zemin tile'ları
    groundTiles.forEach(tile => {
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(tile.x, tile.y, tileSize, tileSize);
        ctx.strokeStyle = '#5D3A1A';
        ctx.strokeRect(tile.x, tile.y, tileSize, tileSize);
        ctx.fillStyle = '#A0522D';
        ctx.font = '10px Arial';
        ctx.fillText(tile.type + '.png', tile.x + 5, tile.y + 20);
    });
    
    // Süs objeleri
    decorations.forEach(dec => {
        if (dec.type === 'bush') {
            ctx.fillStyle = '#2E8B57';
            ctx.beginPath();
            ctx.arc(dec.x + 16, dec.y + 8, 10, 0, Math.PI * 2);
            ctx.fill();
        } else if (dec.type === 'mushroom') {
            ctx.fillStyle = '#FF6347';
            ctx.fillRect(dec.x, dec.y, 16, 16);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(dec.x + 4, dec.y + 8, 8, 8);
        } else if (dec.type === 'stone') {
            ctx.fillStyle = '#808080';
            ctx.fillRect(dec.x, dec.y, 20, 10);
        } else if (dec.type === 'tree') {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(dec.x, dec.y - 20, 10, 40);
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(dec.x + 5, dec.y - 25, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // DÜŞMAN (Solda - Suikastçi)
    ctx.save();
    ctx.translate(enemy.x + 25, enemy.y + 32);
    ctx.fillStyle = '#8B0000';
    ctx.font = '12px Arial';
    ctx.fillText('DÜŞMAN', -25, -40);
    
    // Düşman durumuna göre renk
    if (enemy.state === 'attack') {
        ctx.fillStyle = '#FF4500'; // Saldırı kırmızı
    } else if (enemy.state === 'hurt') {
        ctx.fillStyle = '#800080'; // Yaralı mor
    } else if (enemy.state === 'walk') {
        ctx.fillStyle = '#B22222'; // Yürürken
    } else {
        ctx.fillStyle = '#8B0000'; // Idle
    }
    
    ctx.fillRect(-20, -32, 40, 64);
    
    // Animasyon frame yazısı
    ctx.fillStyle = '#fff';
    ctx.font = '8px Arial';
    ctx.fillText(`${enemy.state}_${enemy.frame}.png`, -20, -20);
    
    // Düşman sağlık barı
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-20, -45, 40 * (enemyHealth/100), 5);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(-20, -45, 40, 5);
    ctx.restore();
    
    // KAHRAMAN (Sağda - Şövalye)
    ctx.save();
    ctx.translate(player.x + 25, player.y + 32);
    ctx.fillStyle = '#4169E1';
    ctx.font = '12px Arial';
    ctx.fillText('KAHRAMAN', -30, -40);
    
    // Kahraman durumuna göre renk
    if (player.isAttacking) {
        ctx.fillStyle = '#FFD700'; // Saldırı altın
    } else if (player.isJumping) {
        ctx.fillStyle = '#87CEEB'; // Zıplama gök mavisi
    } else if (player.state === 'walk') {
        ctx.fillStyle = '#1E90FF'; // Yürürken
    } else {
        ctx.fillStyle = '#4169E1'; // Idle
    }
    
    ctx.fillRect(-20, -32, 40, 64);
    
    // Animasyon frame yazısı
    ctx.fillStyle = '#000';
    ctx.font = '8px Arial';
    if (player.isJumping) {
        ctx.fillText(`Jump (${player.frame + 3}).png`, -20, -20);
    } else if (player.isAttacking) {
        ctx.fillText(`JumpAttack (${player.frame + 1}).png`, -20, -20);
    } else if (player.state === 'walk') {
        ctx.fillText(`Walk (${player.frame + 1}).png`, -20, -20);
    } else {
        ctx.fillText(`Idle.png`, -20, -20);
    }
    
    // Kahraman sağlık barı
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(-20, -45, 40 * (playerHealth/100), 5);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(-20, -45, 40, 5);
    ctx.restore();
    
    // Skor ve level bilgisi
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Skor: ${playerScore}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 10, 60);
}

function playerDie() {
    gameRunning = false;
    playerDeathCount++;
    playerHealth = 100;
    document.getElementById('gameOverModal').style.display = 'flex';
}

function showMathQuestion() {
    const levelQuestions = questionsByLevel[Math.min(level, 4)] || questionsByLevel[4];
    currentQuestions = [...levelQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    currentQuestionIndex = 0;
    
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('mathModal').style.display = 'flex';
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        // Tüm sorular bitti
        document.getElementById('mathModal').style.display = 'none';
        gameRunning = true;
        enemyHealth = 100;
        return;
    }
    
    const q = currentQuestions[currentQuestionIndex];
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('question-text').textContent = q.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(index, q.correct, btn);
        optionsContainer.appendChild(btn);
    });
    
    document.getElementById('feedback').textContent = '';
}

function checkAnswer(selected, correct, btn) {
    const buttons = document.querySelectorAll('.option-btn');
    
    if (selected === correct) {
        btn.classList.add('correct');
        document.getElementById('feedback').textContent = '✅ Doğru!';
        
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < currentQuestions.length) {
                displayQuestion();
            } else {
                document.getElementById('mathModal').style.display = 'none';
                gameRunning = true;
                enemyHealth = 100;
            }
        }, 1000);
    } else {
        btn.classList.add('wrong');
        buttons[correct].classList.add('correct');
        document.getElementById('feedback').textContent = '❌ Yanlış! Doğru cevabı öğren.';
        
        setTimeout(() => {
            buttons.forEach(b => {
                b.classList.remove('correct', 'wrong');
            });
            document.getElementById('feedback').textContent = '';
        }, 2000);
    }
}

function showLevelUp() {
    document.getElementById('level-up-text').textContent = `Tebrikler! Level ${level}'e yükseldin! Düşmanlar daha güçlü!`;
    document.getElementById('levelUpModal').style.display = 'flex';
    
    setTimeout(() => {
        document.getElementById('levelUpModal').style.display = 'none';
    }, 2000);
}

// Event Listeners
document.getElementById('startQuestions').addEventListener('click', showMathQuestion);
document.getElementById('continueGame').addEventListener('click', () => {
    document.getElementById('levelUpModal').style.display = 'none';
});

// Animasyon döngüsü
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Oyunu başlat
gameLoop();

// Frame sayacı (animasyonlar için)
setInterval(() => {
    if (gameRunning) {
        player.frame = (player.frame + 1) % 10;
        enemy.frame = (enemy.frame + 1) % 10;
    }
}, 100);
