// ===== g-core.js : 상태/DOM참조/데이터베이스/플레이어/배열/Particle =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const scoreUi = document.getElementById('score');
const levelUi = document.getElementById('level');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const skinScreen = document.getElementById('skin-screen');
const editScreen = document.getElementById('edit-screen');
const usernameInput = document.getElementById('username-input');

const startBtn = document.getElementById('btn-start');
const restartBtn = document.getElementById('btn-restart');
const mainShopBtn = document.getElementById('btn-main-shop');
const deadShopBtn = document.getElementById('btn-dead-shop');
const mainEditBtn = document.getElementById('btn-main-edit');
const deadEditBtn = document.getElementById('btn-dead-edit');
const backSkinBtn = document.getElementById('btn-back-skin');
const backEditBtn = document.getElementById('btn-back-edit');

const finalScoreUi = document.getElementById('final-score');
const rankingListUi = document.getElementById('ranking-list');
const skinContainer = document.getElementById('skin-container');
const dieEffectsGrid = document.getElementById('die-effects-grid');
const trailsGrid = document.getElementById('trails-grid');

// Game Control State
let isPlaying = false;
let isDying = false; // 사망 시네마틱 상태 변수 추가
let dieTimer = 0;    // 사망 딜레이 타이머
let deathDuration = 1200; // 사망 연출 길이(효과별로 다름)
let score = 0;
let level = 1;
let lastTime = 0;
let obstacleTimer = 0;
let playerName = "Unknown";
let lastScreen = 'start';
let nextRestAt = 15;    // 다음 생존 보너스(휴식) 발동 시점(초)
let restEndScore = 0;   // 이 점수(초)까지 새 장애물 생성 중단
let shakeTime = 0, shakeMag = 0, shakeDur = 1; // 화면 흔들림
let trailEmitAcc = 0;   // 음식 트레일 생성 간격 누적

// ===== Economy: coins / shards / unlocks / achievements (persisted) =====
let currentUser = null;   // 로그인한 계정 이름
let accounts = {};        // username -> { pw, economy }
let coins = 0;
let shards = 0;
let ownedItems = {};      // id -> true  (skins / trails / death effects share ids)
let totalPlays = 0;
let dailyStreak = 0;
let lastDailyDate = '';
let achDone = {};         // achievement id -> true
const BOX_PRICE = 500;    // coins per box
const SHARD_PRICE = 150;  // shards to buy a specific item
const DUP_SHARDS = 50;    // shards given on duplicate
const ACHIEVEMENTS = [
    { id: 'first_play', name: 'First Play', reward: 50, test: () => totalPlays >= 1 },
    { id: 'survive20', name: 'Survive 20s', reward: 100, test: () => score >= 20 },
    { id: 'plays50', name: 'Play 50 Games', reward: 500, test: () => totalPlays >= 50 }
];

// Skins Database
const skins = [
    { id: 'default', name: 'Mint Slime', color: '#00ffcc', accessory: 'none' },
    { id: 'crown', name: 'Pink Crown Slime', color: '#ff66aa', accessory: 'crown' },
    { id: 'knight', name: 'Blue Knight Slime', color: '#3366ff', accessory: 'knight' },
    { id: 'cloak', name: 'Grey Cloak Slime', color: '#ff4444', accessory: 'cloak' },
    { id: 'miku', name: 'Twin-tail', color: '#33cccc', accessory: 'miku' },
    { id: 'teto', name: 'Twin-drill', color: '#ff4d6a', accessory: 'teto' },
    // --- Parody skins (names slightly twisted to avoid copyright) ---
    { id: 'maid', name: 'Blue Maid Slime', color: '#7eb6ff', accessory: 'maid' },
    { id: 'mouse', name: 'Electric Mouse Slime', color: '#ffe600', accessory: 'mouse' },
    { id: 'ninja', name: 'Orange Ninja Slime', color: '#ff8a3d', accessory: 'ninja' },
    { id: 'creeper', name: 'Cryper Slime', color: '#5fbf5f', accessory: 'creeper' }
];
let currentSkinId = 'default';

// Death Effects Database
const dieEffects = [
    { id: 'bomb', name: 'Bomb', icon: '💥' },
    { id: 'thunder', name: 'Thunder', icon: '⚡' },
    { id: 'cherry', name: 'Cherry', icon: '🌸' },
    { id: 'fire', name: 'Fire', icon: '🔥' }
];
let currentDieEffectId = 'bomb';

// Geometry Dash Type Ribbon Trail Database
const trailEffects = [
    { id: 'none', name: 'Default', icon: '🟢' },
    { id: 'rainbow', name: 'Rainbow', icon: '🌈' },
    { id: 'flame', name: 'Flame', icon: '🔥' },
    { id: 'lightning', name: 'Lightning', icon: '⚡' },
    { id: 'star', name: 'Stardust', icon: '✨' },
    { id: 'cherry', name: 'Cherry', icon: '🌸' },
    { id: 'pixel', name: 'Pixel', icon: '🟪' },
    { id: 'spark', name: 'Spark', icon: '🎇' },
    { id: 'plasma', name: 'Plasma', icon: '🔮' }
];
let currentTrailId = 'none';

const player = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    radius: 14,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    speed: 0.16,
    vx: 0,
    vy: 0
};

// Obstacles & Advanced Custom Ribbon Arrays
let lasers = [];
let spikes = [];
let missiles = [];
let saws = [];
let particles = [];
let trailHistory = []; // 지오메트리 대쉬 선 연결형 실시간 좌표 추적 배열
let floatingTexts = []; // "+0.3!" 같은 떠오르는 문구

// ===== Graze(미세 회피) & Fever 시스템 상태 =====
const GRAZE_MARGIN = 32;       // 충돌 반경 바깥 이 거리 안으로 스치면 미세 회피 (판정 후하게)
const FEVER_STEP = 1 / 12;     // 미세 회피 1회당 게이지 충전량
const FEVER_RESET_MS = 5000;   // 마지막 미세 회피 후 5초간 추가 회피 없으면 게이지 초기화
const FEVER_DURATION_MS = 10000; // fever 지속 시간 10초
let feverGauge = 0;            // 0 ~ 1
let feverActive = false;
let feverTimer = 0;            // fever 발동 후 경과 시간
let grazeIdleTimer = 0;        // 마지막 미세 회피 후 경과 시간(게임 시간 기준)

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Death Particle System
class Particle {
    constructor(x, y, vx, vy, color, size, maxLife) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.color = color;
        this.size = size;
        this.maxLife = maxLife;
        this.life = maxLife;
    }
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vx *= 0.97; // 자연스러운 속도 감속 감쇄
        this.vy *= 0.97;
        this.life -= deltaTime;
    }
    draw(timeScale) {
        let alpha = this.life / this.maxLife;
        if (alpha < 0) alpha = 0;
        // shadowBlur 제거(성능): 많은 파티클을 가볍게 렌더
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}
