// ===== g-effects.js : 슬라임/트레일/사망이펙트/벚꽃나무/Graze·Fever/플로팅텍스트 =====
// 크리퍼(네모/픽셀) 슬라임은 통째로 사각 렌더링
function drawCreeperSlime(context, x, y, radius, skinConfig) {
    context.save();
    let s = radius * 1.75;
    context.shadowBlur = 12; context.shadowColor = '#3aa83a';
    context.fillStyle = skinConfig.color;
    context.fillRect(x - s / 2, y - s / 2, s, s);
    context.shadowBlur = 0;
    // 픽셀 명암 (체크 패턴)
    context.fillStyle = 'rgba(0,0,0,0.12)';
    let px = s / 4;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) context.fillRect(x - s / 2 + i * px, y - s / 2 + j * px, px, px);
    // 크리퍼 얼굴
    context.fillStyle = '#0d260d';
    let e = s * 0.2;
    context.fillRect(x - s * 0.26 - e / 2, y - s * 0.18, e, e); // 왼쪽 눈
    context.fillRect(x + s * 0.26 - e / 2, y - s * 0.18, e, e); // 오른쪽 눈
    context.fillRect(x - e * 0.5, y - s * 0.02, e, s * 0.32);   // 입(세로)
    context.fillRect(x - s * 0.18, y + s * 0.18, s * 0.36, e);  // 입(가로)
    context.restore();
}

// Slime Sprite Drawing Engine
function drawSlime(context, x, y, radius, skinConfig, vx = 0, vy = 0) {
    if (skinConfig.accessory === 'creeper') { drawCreeperSlime(context, x, y, radius, skinConfig); return; }
    context.save(); context.shadowBlur = 15; context.shadowColor = skinConfig.color;
    if (skinConfig.accessory === 'cloak') {
        context.fillStyle = '#7a7a85'; context.shadowColor = '#55555a'; context.beginPath(); context.arc(x, y - 1, radius + 5, 0, Math.PI * 2); context.fill();
        context.beginPath(); context.moveTo(x - 6, y - radius); context.lineTo(x, y - radius - 8); context.lineTo(x + 6, y - radius); context.fill();
    } else if (skinConfig.accessory === 'miku') {
        context.fillStyle = '#33cccc'; context.shadowColor = '#33cccc'; context.shadowBlur = 10;
        // 이동 반대 방향으로 양쪽 머리가 흩날림 (관성/물리)
        let sx = Math.max(-16, Math.min(16, -vx * 2.6));
        let sy = Math.max(-10, Math.min(20, -vy * 2.6));
        // 왼쪽 트윈테일
        context.beginPath(); context.moveTo(x - radius + 2, y - 6);
        context.bezierCurveTo(x - radius - 18 + sx * 0.5, y - 12 + sy * 0.4, x - radius - 20 + sx, y + 16 + sy, x - radius - 12 + sx, y + 28 + sy);
        context.bezierCurveTo(x - radius - 8 + sx, y + 20 + sy, x - radius - 6 + sx * 0.5, y + 4 + sy * 0.4, x - radius + 2, y - 2); context.fill();
        // 오른쪽 트윈테일
        context.beginPath(); context.moveTo(x + radius - 2, y - 6);
        context.bezierCurveTo(x + radius + 18 + sx * 0.5, y - 12 + sy * 0.4, x + radius + 20 + sx, y + 16 + sy, x + radius + 12 + sx, y + 28 + sy);
        context.bezierCurveTo(x + radius + 8 + sx, y + 20 + sy, x + radius + 6 + sx * 0.5, y + 4 + sy * 0.4, x + radius - 2, y - 2); context.fill();
        context.fillStyle = '#ff3388'; context.fillRect(x - radius - 3, y - 8, 5, 3); context.fillRect(x + radius - 2, y - 8, 5, 3);
    } else if (skinConfig.accessory === 'teto') {
        // 이동 반대 방향으로 양쪽 드릴이 흩날림
        let sx = Math.max(-14, Math.min(14, -vx * 2.2));
        let sy = Math.max(-10, Math.min(16, -vy * 2.2));
        let lxc = x - radius - 6 + sx, rxc = x + radius + 6 + sx, dyc = y + sy;
        context.fillStyle = '#ff4d6a'; context.shadowColor = '#ff4d6a'; context.shadowBlur = 10;
        context.beginPath(); context.arc(lxc, dyc, 9, 0, Math.PI * 2); context.fill();
        context.fillStyle = '#111'; context.beginPath(); context.arc(lxc, dyc, 4, 0, Math.PI * 2); context.fill();
        context.fillStyle = '#ff4d6a'; context.beginPath(); context.arc(rxc, dyc, 9, 0, Math.PI * 2); context.fill();
        context.fillStyle = '#111'; context.beginPath(); context.arc(rxc, dyc, 4, 0, Math.PI * 2); context.fill();
    } else if (skinConfig.accessory === 'maid') {
        // 연블루 머리 (몸 뒤) + 이동 반대 방향으로 흩날리는 긴 생머리
        let sx = Math.max(-16, Math.min(16, -vx * 2.6));
        let sy = Math.max(-10, Math.min(20, -vy * 2.6));
        context.fillStyle = '#a9cdf2'; context.shadowColor = '#a9cdf2'; context.shadowBlur = 12;
        context.beginPath(); context.arc(x, y - 1, radius + 4, 0, Math.PI * 2); context.fill();
        // 왼쪽 긴 머리
        context.beginPath();
        context.moveTo(x - radius - 1, y - 2);
        context.quadraticCurveTo(x - radius - 8 + sx, y + radius + 8 + sy, x - radius - 1 + sx, y + radius + 18 + sy);
        context.lineTo(x - radius + 6 + sx, y + radius + 10 + sy);
        context.quadraticCurveTo(x - radius + 2 + sx * 0.4, y + 8 + sy * 0.3, x - radius + 4, y - 2);
        context.closePath(); context.fill();
        // 오른쪽 긴 머리
        context.beginPath();
        context.moveTo(x + radius + 1, y - 2);
        context.quadraticCurveTo(x + radius + 8 + sx, y + radius + 8 + sy, x + radius + 1 + sx, y + radius + 18 + sy);
        context.lineTo(x + radius - 6 + sx, y + radius + 10 + sy);
        context.quadraticCurveTo(x + radius - 2 + sx * 0.4, y + 8 + sy * 0.3, x + radius - 4, y - 2);
        context.closePath(); context.fill();
    } else if (skinConfig.accessory === 'mouse') {
        // 번개 모양 꼬리 (오른쪽 뒤)
        context.fillStyle = '#ffcc00'; context.shadowColor = '#ffcc00'; context.shadowBlur = 10;
        context.beginPath();
        context.moveTo(x + radius - 2, y + 5);
        context.lineTo(x + radius + 11, y + 1); context.lineTo(x + radius + 5, y - 2);
        context.lineTo(x + radius + 17, y - 11); context.lineTo(x + radius + 9, y - 12);
        context.lineTo(x + radius + 18, y - 24); context.lineTo(x + radius + 5, y - 15);
        context.lineTo(x + radius + 9, y - 8); context.lineTo(x + radius - 2, y - 1);
        context.closePath(); context.fill();
        // 귀 (검은 끝)
        context.fillStyle = skinConfig.color; context.shadowColor = skinConfig.color; context.shadowBlur = 8;
        context.beginPath(); context.moveTo(x - 7, y - radius + 2); context.lineTo(x - 11, y - radius - 10); context.lineTo(x - 2, y - radius - 1); context.closePath(); context.fill();
        context.beginPath(); context.moveTo(x + 7, y - radius + 2); context.lineTo(x + 11, y - radius - 10); context.lineTo(x + 2, y - radius - 1); context.closePath(); context.fill();
        context.fillStyle = '#222'; context.shadowBlur = 0;
        context.beginPath(); context.moveTo(x - 11, y - radius - 10); context.lineTo(x - 8, y - radius - 4); context.lineTo(x - 5, y - radius - 5); context.closePath(); context.fill();
        context.beginPath(); context.moveTo(x + 11, y - radius - 10); context.lineTo(x + 8, y - radius - 4); context.lineTo(x + 5, y - radius - 5); context.closePath(); context.fill();
    } else if (skinConfig.accessory === 'ninja') {
        // 이마 보호대 끈 두 가닥 (등 뒤)
        context.fillStyle = '#33548f'; context.shadowColor = '#33548f'; context.shadowBlur = 6;
        context.beginPath(); context.moveTo(x - radius + 4, y - radius + 6); context.lineTo(x - radius - 9, y + 6); context.lineTo(x - radius - 4, y + 9); context.lineTo(x - radius + 6, y - radius + 9); context.closePath(); context.fill();
        context.beginPath(); context.moveTo(x - radius + 3, y - radius + 9); context.lineTo(x - radius - 13, y + 17); context.lineTo(x - radius - 8, y + 19); context.lineTo(x - radius + 6, y - radius + 12); context.closePath(); context.fill();
        context.shadowBlur = 15; context.shadowColor = skinConfig.color; // 몸통도 다른 슬라임처럼 발광
    }
    context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fillStyle = skinConfig.color; context.fill(); context.shadowBlur = 0;
    if (skinConfig.accessory === 'cloak') {
        context.fillStyle = '#5c5c66'; context.beginPath(); context.arc(x - 5, y + radius - 3, 4, 0, Math.PI * 2); context.arc(x + 5, y + radius - 3, 4, 0, Math.PI * 2); context.fill();
        context.fillStyle = '#ffcc00'; context.beginPath(); context.arc(x, y + radius - 4, 2.5, 0, Math.PI * 2); context.fill();
    } else if (skinConfig.accessory === 'crown') {
        context.fillStyle = '#ffcc00'; context.beginPath(); context.moveTo(x - 10, y - radius + 2); context.lineTo(x - 12, y - radius - 8); context.lineTo(x - 4, y - radius - 3); context.lineTo(x, y - radius - 11); context.lineTo(x + 4, y - radius - 3); context.lineTo(x + 12, y - radius - 8); context.lineTo(x + 10, y - radius + 2); context.closePath(); context.fill();
        context.fillStyle = '#ff0000'; context.beginPath(); context.arc(x, y - radius - 3, 2, 0, Math.PI * 2); context.fill();
    } else if (skinConfig.accessory === 'knight') {
        context.strokeStyle = '#cccccc'; context.lineWidth = 3; context.lineCap = 'round'; context.beginPath(); context.moveTo(x + radius, y + 4); context.lineTo(x + radius + 8, y - 8); context.stroke();
        context.fillStyle = '#999999'; context.strokeStyle = '#ffffff'; context.lineWidth = 1; context.beginPath(); context.arc(x - radius + 2, y + 2, 6, 0, Math.PI, false); context.lineTo(x - radius + 2, y - 4); context.closePath(); context.fill(); context.stroke();
    } else if (skinConfig.accessory === 'maid') {
        // 앞머리 뱅 (이마를 덮는 연블루 생머리)
        context.fillStyle = '#aaccf2';
        context.beginPath();
        context.moveTo(x - radius + 1, y - 3);
        context.quadraticCurveTo(x, y - radius - 3, x + radius - 1, y - 3);
        context.quadraticCurveTo(x + radius - 5, y - 8, x + 3, y - 6);
        context.quadraticCurveTo(x, y - 1, x - 3, y - 6);
        context.quadraticCurveTo(x - radius + 5, y - 8, x - radius + 1, y - 3);
        context.fill();
        // 흰 메이드 머리장식 (프릴 밴드 + 여러 봉우리)
        context.fillStyle = '#ffffff';
        context.fillRect(x - 12, y - radius - 1, 24, 4);
        context.beginPath();
        for (let i = -2; i <= 2; i++) context.arc(x + i * 5.6, y - radius - 1, 3.2, Math.PI, 0, false);
        context.fill();
        // 핑크 십자 레이스 (옆쪽으로 늘어진 끈)
        context.strokeStyle = '#ff6fae'; context.lineWidth = 1.6; context.lineCap = 'round';
        let lx = x + radius - 1, ly = y - 1;
        context.beginPath();
        context.moveTo(lx - 3, ly - 5); context.lineTo(lx + 3, ly + 1);
        context.moveTo(lx + 3, ly - 5); context.lineTo(lx - 3, ly + 1);
        context.moveTo(lx - 3, ly + 1); context.lineTo(lx + 3, ly + 7);
        context.moveTo(lx + 3, ly + 1); context.lineTo(lx - 3, ly + 7);
        context.stroke();
    } else if (skinConfig.accessory === 'mouse') {
        // 빨간 볼
        context.fillStyle = '#ff5a5a';
        context.beginPath(); context.arc(x - radius + 4, y + 4, 2.6, 0, Math.PI * 2); context.arc(x + radius - 4, y + 4, 2.6, 0, Math.PI * 2); context.fill();
    } else if (skinConfig.accessory === 'ninja') {
        // 이마 보호대 (회색 밴드 + 금속판)
        context.fillStyle = '#2b2b2b'; context.fillRect(x - radius + 1, y - radius + 1, radius * 2 - 2, 6);
        context.fillStyle = '#b9c0c7'; context.fillRect(x - 7, y - radius + 1, 14, 6);
        context.fillStyle = '#e8edf1'; context.fillRect(x - 7, y - radius + 1, 14, 2);
        context.fillStyle = '#6b7178'; context.beginPath(); context.arc(x, y - radius + 4, 1.6, 0, Math.PI * 2); context.fill();
    }
    // 눈
    context.beginPath(); context.arc(x - 4, y - 2, 2, 0, Math.PI * 2); context.arc(x + 4, y - 2, 2, 0, Math.PI * 2); context.fillStyle = '#111111'; context.fill();
    context.restore();
}

// ===== Shape Helpers (벚꽃 꽃잎 / 별 / 꽃송이) =====
function drawPetal(context, x, y, size, angle, color, alpha, shadow = true) {
    context.save();
    context.globalAlpha = alpha;
    context.translate(x, y);
    context.rotate(angle);
    context.fillStyle = color;
    if (shadow) { context.shadowBlur = 6; context.shadowColor = color; }
    // 원래 벚꽃잎 모양 (끝이 살짝 갈라진 사쿠라 꽃잎)
    context.beginPath();
    context.moveTo(0, -size);
    context.bezierCurveTo(size * 0.85, -size * 0.6, size * 0.7, size * 0.55, size * 0.18, size);
    context.lineTo(0, size * 0.78);
    context.lineTo(-size * 0.18, size);
    context.bezierCurveTo(-size * 0.7, size * 0.55, -size * 0.85, -size * 0.6, 0, -size);
    context.fill();
    context.restore();
}

function drawStarShape(context, x, y, size, angle, color, alpha) {
    context.save();
    context.globalAlpha = alpha;
    context.translate(x, y);
    context.rotate(angle);
    context.fillStyle = color;
    context.shadowBlur = 10;
    context.shadowColor = color;
    context.beginPath();
    for (let i = 0; i < 5; i++) {
        let a = (Math.PI * 2 / 5) * i - Math.PI / 2;
        let ox = Math.cos(a) * size, oy = Math.sin(a) * size;
        if (i === 0) context.moveTo(ox, oy); else context.lineTo(ox, oy);
        let a2 = a + Math.PI / 5;
        context.lineTo(Math.cos(a2) * size * 0.45, Math.sin(a2) * size * 0.45);
    }
    context.closePath();
    context.fill();
    context.restore();
}

function drawBlossom(context, x, y, size, color, alpha, shadow = true) {
    for (let i = 0; i < 5; i++) {
        let a = (Math.PI * 2 / 5) * i;
        drawPetal(context, x + Math.cos(a) * size * 0.5, y + Math.sin(a) * size * 0.5, size, a + Math.PI / 2, color, alpha, shadow);
    }
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = '#fff3b0';
    context.beginPath();
    context.arc(x, y, size * 0.3, 0, Math.PI * 2);
    context.fill();
    context.restore();
}

// ===== Particle-based Trails (별가루 / 벚꽃) =====
const PIXEL_COLORS = ['#ff5577', '#ffd23f', '#3fd0ff', '#7CFC00', '#c77dff', '#ffffff'];
const SPARK_COLORS = ['#ffffff', '#fff1a8', '#a8e6ff', '#ffd36e'];

class TrailParticle {
    constructor(x, y, vx, vy, type) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.type = type;
        this.angle = Math.random() * Math.PI * 2;
        this.swayPhase = Math.random() * Math.PI * 2;
        // 기본값
        this.spin = (Math.random() - 0.5) * 0.012;
        this.maxLife = 450 + Math.random() * 400;
        this.size = 3 + Math.random() * 4;
        this.gravity = 0.00004;
        this.color = '#ffe600';
        this.emoji = null;
        if (type === 'cherry') {
            this.maxLife = 900 + Math.random() * 500; this.size = 4 + Math.random() * 4;
            this.color = Math.random() > 0.4 ? '#ffb7c5' : '#ff99b4'; this.gravity = 0.00016;
        } else if (type === 'star') {
            this.color = Math.random() > 0.5 ? '#ffe600' : '#fff7aa';
        } else if (type === 'pixel') {
            this.size = 4 + Math.random() * 5; this.maxLife = 550 + Math.random() * 450;
            this.spin = 0; this.gravity = 0.00005; // 거의 안 떨어지고 진행방향으로 길게 잔상
            this.angle = Math.atan2(this.vy, this.vx); // 속도 방향으로 정렬
            this.color = PIXEL_COLORS[Math.floor(Math.random() * PIXEL_COLORS.length)];
        } else if (type === 'spark') {
            this.size = 1.5 + Math.random() * 2.5; this.maxLife = 280 + Math.random() * 320;
            this.gravity = 0.0001; this.spin = (Math.random() - 0.5) * 0.05;
            this.color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
            this.glint = Math.random() > 0.5;
        } else if (type === 'plasma') {
            this.size = 6 + Math.random() * 7; this.maxLife = 450 + Math.random() * 400;
            this.gravity = 0.00002; this.spin = (Math.random() - 0.5) * 0.01;
            this.hue = 200 + Math.random() * 160; // 청록~보라~핑크
            this.pulse = Math.random() * Math.PI * 2;
        }
        this.life = this.maxLife;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.vy += this.gravity * dt;
        if (this.type === 'cherry') {
            this.swayPhase += dt * 0.005;
            this.x += Math.sin(this.swayPhase) * dt * 0.02;
        } else if (this.type === 'plasma') {
            this.pulse += dt * 0.01;
        }
        this.angle += this.spin * dt;
        this.life -= dt;
    }
    draw() {
        let alpha = Math.max(0, this.life / this.maxLife);
        if (this.type === 'cherry') { drawPetal(ctx, this.x, this.y, this.size, this.angle, this.color, alpha); return; }
        if (this.type === 'star') { drawStarShape(ctx, this.x, this.y, this.size, this.angle, this.color, alpha * 0.9); return; }
        if (this.type === 'pixel') {
            // 속도 방향으로 길게 늘어지는 줄무늬 잔상 (느려질수록 짧아짐)
            let sp = Math.hypot(this.vx, this.vy);
            let len = this.size * 1.6 + sp * 70;
            ctx.save(); ctx.globalAlpha = alpha; ctx.translate(this.x, this.y); ctx.rotate(this.angle);
            ctx.fillStyle = this.color; ctx.shadowBlur = 5; ctx.shadowColor = this.color;
            ctx.fillRect(-len / 2, -this.size * 0.3, len, this.size * 0.6);
            ctx.restore(); return;
        }
        if (this.type === 'spark') {
            // 반짝이는 불꽃 스파크 (가산 합성으로 빛남 + 가끔 십자 반짝)
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color; ctx.shadowBlur = 10; ctx.shadowColor = this.color;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            if (this.glint) {
                ctx.strokeStyle = this.color; ctx.lineWidth = 1;
                let g = this.size * (2 + alpha * 2);
                ctx.beginPath();
                ctx.moveTo(this.x - g, this.y); ctx.lineTo(this.x + g, this.y);
                ctx.moveTo(this.x, this.y - g); ctx.lineTo(this.x, this.y + g);
                ctx.stroke();
            }
            ctx.restore(); return;
        }
        if (this.type === 'plasma') {
            // 부드럽게 빛나는 플라즈마 구체 (색이 청록~핑크, 맥동)
            let r = this.size * (0.8 + 0.25 * Math.sin(this.pulse));
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            let g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
            g.addColorStop(0, `hsla(${this.hue},100%,78%,${alpha})`);
            g.addColorStop(0.5, `hsla(${this.hue},100%,55%,${alpha * 0.6})`);
            g.addColorStop(1, `hsla(${this.hue},100%,50%,0)`);
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2); ctx.fill();
            ctx.restore(); return;
        }
    }
}
let trailParticles = [];

function spawnTrailItem(x, y, pvx, pvy, type, spread = 1.4, sp0 = 0.03, sp1 = 0.12) {
    let baseAngle = Math.atan2(-pvy, -pvx);
    let a = baseAngle + (Math.random() - 0.5) * spread;
    let sp = sp0 + Math.random() * sp1;
    trailParticles.push(new TrailParticle(x, y, Math.cos(a) * sp, Math.sin(a) * sp, type));
}
function spawnTrailStar(x, y, pvx, pvy) { spawnTrailItem(x, y, pvx, pvy, 'star', 1.2, 0.05, 0.16); }
function spawnTrailPetal(x, y, pvx, pvy) { spawnTrailItem(x, y, pvx, pvy, 'cherry', 1.6, 0.03, 0.11); }

// ===== Ribbon Trail Variants =====
const RAINBOW_COLORS = ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#00b0ff', '#3d5afe', '#d500f9'];

// 무지개: 색이 변하는게 아니라 무지개 색을 겹겹이 평행하게 쌓아 그림
function drawRainbowLayers() {
    let n = RAINBOW_COLORS.length;
    let spacing = player.radius * 0.28; // 무지개 두께 축소
    for (let c = 0; c < n; c++) {
        let offset = (c - (n - 1) / 2) * spacing;
        ctx.strokeStyle = RAINBOW_COLORS[c];
        ctx.shadowBlur = 6;
        ctx.shadowColor = RAINBOW_COLORS[c];
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = spacing * 1.15;
        ctx.beginPath();
        let started = false;
        for (let i = 1; i < trailHistory.length; i++) {
            let p1 = trailHistory[i - 1], p2 = trailHistory[i];
            let dx = p2.x - p1.x, dy = p2.y - p1.y;
            let len = Math.hypot(dx, dy) || 1;
            let perpX = -dy / len, perpY = dx / len;
            if (!started) { ctx.moveTo(p1.x + perpX * offset, p1.y + perpY * offset); started = true; }
            ctx.lineTo(p2.x + perpX * offset, p2.y + perpY * offset);
        }
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

// 불꽃: 불 모양을 유지하되 빠르게 움직일수록 진행방향으로 늘어짐
function drawFlameTrail() {
    for (let i = 1; i < trailHistory.length; i++) {
        let p1 = trailHistory[i - 1], p2 = trailHistory[i];
        let ratio = i / trailHistory.length;
        let dx = p2.x - p1.x, dy = p2.y - p1.y;
        let dist = Math.hypot(dx, dy);
        let angle = Math.atan2(dy, dx);
        let stretch = 1 + Math.min(dist / 8, 2.4); // 속도가 빠를수록 늘어남
        let size = player.radius * 1.15 * ratio;
        if (size < 1) continue;
        ctx.save();
        ctx.translate(p2.x, p2.y);
        ctx.rotate(angle);
        ctx.scale(stretch, 1);
        ctx.globalCompositeOperation = 'lighter';
        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        grad.addColorStop(0, `rgba(255, 235, 130, ${0.95 * ratio})`);
        grad.addColorStop(0.45, `rgba(255, 140, 0, ${0.7 * ratio})`);
        grad.addColorStop(1, 'rgba(255, 40, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 번개: 기존 리본 위에 지직거리는 지그재그 + 작은 가지 스파크
function drawLightningTrail() {
    for (let i = 1; i < trailHistory.length; i++) {
        let p1 = trailHistory[i - 1], p2 = trailHistory[i];
        let ratio = i / trailHistory.length;
        let alpha = 0.85 * ratio;
        let dx = p2.x - p1.x, dy = p2.y - p1.y;
        let len = Math.hypot(dx, dy) || 1;
        let perpX = -dy / len, perpY = dx / len;
        let jit = (Math.random() - 0.5) * (6 + len * 0.6);
        let mx = (p1.x + p2.x) / 2 + perpX * jit;
        let my = (p1.y + p2.y) / 2 + perpY * jit;
        ctx.strokeStyle = `rgba(150, 240, 255, ${alpha})`;
        ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff';
        ctx.lineWidth = (player.radius * 0.5 * ratio) + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(mx, my);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        if (Math.random() < 0.3 && ratio > 0.3) {
            let bl = 6 + Math.random() * 13;
            let ba = Math.atan2(dy, dx) + (Math.random() - 0.5) * 2.2;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mx + Math.cos(ba) * bl, my + Math.sin(ba) * bl);
            ctx.stroke();
        }
    }
}

// 스파크: 이동 경로를 따라 이어지는 번개. shadowBlur 대신 굵기 겹치기(가산)로 글로우 → 가벼움
function drawSparkLightning() {
    let h = trailHistory;
    if (h.length < 2) return;
    // 경로 점에 살짝 지직 흔들림 (한 번만 계산해 재사용)
    let pts = new Array(h.length);
    for (let i = 0; i < h.length; i++) {
        if (i === 0 || i === h.length - 1) pts[i] = [h[i].x, h[i].y];
        else pts[i] = [h[i].x + (Math.random() - 0.5) * 9, h[i].y + (Math.random() - 0.5) * 9];
    }
    const stroke = (c, w) => {
        ctx.strokeStyle = c; ctx.lineWidth = w;
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.stroke();
    };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    stroke('rgba(255,180,40,0.16)', 9);   // 외곽 글로우
    stroke('rgba(255,210,90,0.5)', 3.5);  // 중간
    stroke('rgba(255,255,255,0.95)', 1.4); // 흰 코어
    ctx.restore();
}

// ===== Death Effect: 번개 (지지직 터짐) =====
class DeathBolt {
    constructor(x, y, angle, scale = 1) {
        this.x = x; this.y = y;
        this.angle = angle;
        this.scale = scale;
        this.length = (60 + Math.random() * 130) * scale;
        this.maxLife = 500 + Math.random() * 400;
        this.life = this.maxLife;
    }
    update(dt) { this.life -= dt; }
    draw() {
        let alpha = Math.max(0, this.life / this.maxLife);
        if (Math.random() < 0.32) return; // 지지직 깜빡임
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255,255,180,${alpha})` : `rgba(150,220,255,${alpha})`;
        ctx.shadowBlur = 8; ctx.shadowColor = '#aef'; // 고정(성능): scale 비례 제거
        ctx.lineCap = 'round';
        ctx.lineWidth = (1.5 + Math.random() * 2.5) * this.scale;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        let segs = 6;
        let step = this.length / segs;
        for (let i = 1; i <= segs; i++) {
            ctx.lineTo(step * i, (Math.random() - 0.5) * 18 * this.scale);
        }
        ctx.stroke();
        ctx.restore();
    }
}
let deathBolts = [];
let thunderDeath = null; // 전기 사망 연출 컨트롤러 { phase, timer, x, y, vx, vy, bounces }

// 화면 흔들림 트리거 (기존보다 강하면 갱신)
function triggerShake(mag, dur) {
    if (mag >= shakeMag || shakeTime <= 0) { shakeMag = mag; shakeDur = dur; shakeTime = dur; }
}

// 전기 사망: 0.1초 멈춤 → 벽에 더 빠르게 2번 튕김 → 중앙으로 모여 화면을 채우는 큰 폭발
function startThunderDeath(px, py) {
    let sp = 2.5; // px/ms (더 빠르게)
    let a = (Math.random() * 0.6 + 0.2) * Math.PI + (Math.random() < 0.5 ? Math.PI : 0);
    thunderDeath = { phase: 'freeze', timer: 0, x: px, y: py, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, bounces: 0 };
}

// 날아가는 동안 플레이어의 트레일을 남김
function thunderTrail(td) {
    trailHistory.push({ x: td.x, y: td.y, time: performance.now() });
    if (trailHistory.length > 25) trailHistory.shift();
    if (currentTrailId === 'star') spawnTrailStar(td.x, td.y, td.vx, td.vy);
    else if (currentTrailId === 'cherry') spawnTrailPetal(td.x, td.y, td.vx, td.vy);
}

function updateThunderDeath(dt) {
    let td = thunderDeath;
    if (!td) return;
    let r = player.radius;
    if (td.phase === 'freeze') {
        td.timer += dt;
        if (td.timer >= 100) { td.phase = 'bounce'; td.timer = 0; } // 0.1초 멈춤
    } else if (td.phase === 'bounce') {
        td.x += td.vx * dt; td.y += td.vy * dt;
        thunderTrail(td);
        let hit = false;
        if (td.x < r) { td.x = r; td.vx = Math.abs(td.vx); hit = true; }
        else if (td.x > canvas.width - r) { td.x = canvas.width - r; td.vx = -Math.abs(td.vx); hit = true; }
        if (td.y < r) { td.y = r; td.vy = Math.abs(td.vy); hit = true; }
        else if (td.y > canvas.height - r) { td.y = canvas.height - r; td.vy = -Math.abs(td.vy); hit = true; }
        if (hit) {
            td.bounces++;
            triggerShake(14, 220); // 벽 부딪힐 때 화면 흔들림
            for (let i = 0; i < 10; i++) {
                let an = Math.random() * Math.PI * 2, s = (0.5 + Math.random() * 1.8) * 0.7;
                particles.push(new Particle(td.x, td.y, Math.cos(an) * s, Math.sin(an) * s, Math.random() > 0.4 ? '#ffff66' : '#bbffff', 1.5 + Math.random() * 2.5, 250 + Math.random() * 200));
            }
            // 2번 튕긴 뒤엔 화면 중앙으로 빠르게 모임
            if (td.bounces >= 2) {
                td.phase = 'tocenter';
                let cx = canvas.width / 2, cy = canvas.height / 2;
                let dx = cx - td.x, dy = cy - td.y, d = Math.hypot(dx, dy) || 1;
                let sp = 2.8;
                td.vx = dx / d * sp; td.vy = dy / d * sp;
            }
        }
    } else if (td.phase === 'tocenter') {
        td.x += td.vx * dt; td.y += td.vy * dt;
        thunderTrail(td);
        let cx = canvas.width / 2, cy = canvas.height / 2;
        if (Math.hypot(cx - td.x, cy - td.y) < 26) { // 중앙 도착 → 폭발
            spawnThunderBurst(cx, cy);
            thunderDeath = null;
        }
    }
}

// 화면을 채우는 거대한 전기 폭발 + 강한 화면 흔들림
function spawnThunderBurst(px, py) {
    triggerShake(26, 500);
    // 화면 전체를 가로지를 만큼 긴 번개를 사방으로
    let reach = Math.hypot(canvas.width, canvas.height); // 화면 대각선
    let boltCount = 18;
    for (let i = 0; i < boltCount; i++) {
        let a = (Math.PI * 2 / boltCount) * i + Math.random() * 0.3;
        let b = new DeathBolt(px, py, a, 1);
        b.length = reach * (0.55 + Math.random() * 0.45); // 화면을 채울 만큼 길게
        b.scale = 2.6;
        deathBolts.push(b);
    }
    for (let i = 0; i < 80; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = (1.0 + Math.random() * 4.0) * 0.6;
        let color = Math.random() > 0.3 ? '#ffff66' : '#bbffff';
        particles.push(new Particle(px, py, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 2 + Math.random() * 4.5, 350 + Math.random() * 450));
    }
}

// ===== Death Effect: 벚꽃 (꽃잎이 터져나오고 가장자리에 벚꽃나무가 부드럽게 피어남) =====
// easing helpers
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutBack(t) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

// 나무용 초경량 벚꽃: 한 번의 path로 5장 꽃잎을 그려 다량 렌더에도 가벼움
// (alpha는 나무 단위로 한 번만 설정해 호출당 save/restore 비용 제거)
function drawCheapBlossom(x, y, s, color) {
    if (s < 0.4) return;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        let a = (Math.PI * 2 / 5) * i - Math.PI / 2;
        ctx.moveTo(x + Math.cos(a) * s * 0.55, y + Math.sin(a) * s * 0.55);
        ctx.arc(x + Math.cos(a) * s * 0.55, y + Math.sin(a) * s * 0.55, s * 0.78, 0, Math.PI * 2); // 통통한 둥근 꽃잎
    }
    ctx.fill();
    ctx.fillStyle = '#ffe27a'; // 크고 노란 귀여운 중심
    ctx.beginPath();
    ctx.arc(x, y, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
}

// 강한 오버슈트(띠용) easing
function easeOutBackStrong(t) { const c1 = 2.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

// 벚꽃 무리(필드): 가지 없이 동글동글 꽃이 화면을 꽉 채웠다가 다시 빨려 들어감
class CherryTree {
    constructor() {
        this.cx = canvas.width / 2;
        this.cy = canvas.height / 2;
        this.blossoms = [];
        this.anim = 0;          // in: 0→1
        this.hold = 0;          // 꽉 찬 상태 유지
        this.phase = 'in';      // 'in' → 'hold' → 'out'
        this.dead = false;
        this.life = 9999;
        this.buildField();
    }
    buildField() {
        let W = canvas.width, H = canvas.height;
        // 각 꽃의 출발/도착 가장자리 앵커(가장 가까운 변)를 함께 저장
        const push = (x, y, s) => {
            let dl = x, dr = W - x, dt = y, db = H - y;
            let m = Math.min(dl, dr, dt, db);
            let ax, ay;
            if (m === dl) { ax = -10; ay = y; }
            else if (m === dr) { ax = W + 10; ay = y; }
            else if (m === dt) { ax = x; ay = -10; }
            else { ax = x; ay = H + 10; }
            this.blossoms.push({ x, y, s, ax, ay, ang: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 2.2, delay: Math.random() * 0.4, c: Math.random() > 0.5 ? '#ffb7c5' : '#ffd0dc' });
        };
        // 가장자리 띠 (안쪽으로 3겹, 진하게)
        let cols = Math.ceil(W / 28), rows = Math.ceil(H / 28);
        for (let r = 0; r < 3; r++) {
            let inset = 14 + r * 30;
            for (let i = 0; i <= cols; i++) {
                let x = i / cols * W + (Math.random() - 0.5) * 22;
                push(x, inset + (Math.random() - 0.5) * 22, 8 + Math.random() * 9);
                push(x, H - inset + (Math.random() - 0.5) * 22, 8 + Math.random() * 9);
            }
            for (let i = 0; i <= rows; i++) {
                let y = i / rows * H + (Math.random() - 0.5) * 22;
                push(inset + (Math.random() - 0.5) * 22, y, 8 + Math.random() * 9);
                push(W - inset + (Math.random() - 0.5) * 22, y, 8 + Math.random() * 9);
            }
        }
        // (내부 흩뿌림 제거 — 화면 중앙은 흩날리는 꽃잎이 채우므로 가장자리에만 큰 벚꽃)
    }
    update(dt) {
        // 슬로우모션 사망시간(게임시간 ~700ms) 안에 등장→유지→수축이 모두 끝나도록
        if (this.phase === 'in') {
            this.anim += dt * 0.007;
            if (this.anim >= 1) { this.anim = 1; this.phase = 'hold'; }
        } else if (this.phase === 'hold') {
            this.hold += dt;
            if (this.hold > 200) this.phase = 'out';
        } else { // out: 가장자리로 다시 빨려 들어가 사라짐
            this.anim -= dt * 0.007;
            if (this.anim <= 0) { this.anim = 0; this.dead = true; this.life = 0; }
        }
    }
    draw() {
        let out = this.phase === 'out';
        for (let b of this.blossoms) {
            // 꽃마다 delay를 줘 물결치듯 순차적으로 등장/퇴장 (고급스러운 흐름)
            let raw = (this.anim - b.delay) / (1 - b.delay);
            raw = Math.max(0, Math.min(1, raw));
            if (raw <= 0.001) continue;
            // in: 부드러운 오버슈트(띠용), out: 가속하며 빨려나감
            let prog = out ? (raw * raw) : easeOutBackStrong(raw);
            prog = Math.max(0, prog);
            let px = b.ax + (b.x - b.ax) * prog, py = b.ay + (b.y - b.ay) * prog;
            let rot = b.ang + (1 - raw) * b.spin;            // 회전하며 안착
            let alpha = Math.min(1, raw * 1.8) * 0.97;        // 서서히 또렷해짐
            let r = b.s * 1.5 * Math.max(0.12, Math.min(1.1, prog));
            drawPetal(ctx, px, py, r, rot, b.c, alpha, false);
        }
    }
}
let cherryTrees = [];

// 화면을 꽉 채우는 벚꽃 무리 1개 생성
function spawnEdgeCherryTrees() {
    cherryTrees.push(new CherryTree());
}

function spawnCherryDeath(px, py) {
    // 1) 죽은 자리에서 터져나오는 꽃잎
    for (let i = 0; i < 65; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = (0.4 + Math.random() * 1.9) * 0.4;
        let p = new TrailParticle(px, py, Math.cos(angle) * speed, Math.sin(angle) * speed, 'cherry');
        p.maxLife = 1100 + Math.random() * 700; p.life = p.maxLife;
        p.size = 4 + Math.random() * 5;
        trailParticles.push(p);
    }
    // 2) 화면 중간중간 전체에 흩날리는 꽃잎 (살랑살랑 떨어짐)
    for (let i = 0; i < 70; i++) {
        let rx = Math.random() * canvas.width;
        let ry = Math.random() * canvas.height;
        let p = new TrailParticle(rx, ry, (Math.random() - 0.5) * 0.09, 0.02 + Math.random() * 0.07, 'cherry');
        p.maxLife = 1500 + Math.random() * 1000; p.life = p.maxLife;
        p.size = 4 + Math.random() * 4;
        trailParticles.push(p);
    }
    spawnEdgeCherryTrees();
}

// ===== Floating Text (+0.3! / +0.1! / FEVER!) =====
class FloatingText {
    constructor(x, y, text, color, big) {
        this.x = x; this.y = y;
        this.text = text;
        this.color = color;
        this.big = !!big;
        this.maxLife = big ? 1300 : 800;
        this.life = this.maxLife;
        this.vy = big ? -0.02 : -0.05;
    }
    update(dt) { this.y += this.vy * dt; this.life -= dt; }
    draw() {
        let alpha = Math.max(0, this.life / this.maxLife);
        let pop = this.big ? 1 : Math.min(1, (this.maxLife - this.life) / 120); // 살짝 튀어나오는 느낌
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 4;
        ctx.font = `bold ${(this.big ? 34 : 20) * pop}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10; ctx.shadowColor = this.color;
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}
function spawnFloatingText(x, y, text, color, big) {
    floatingTexts.push(new FloatingText(x, y, text, color, big));
}

// ===== Graze(미세 회피) & Fever 제어 =====
function onGraze(x, y) {
    score += 0.3; // 게임플레이에 0.3초 추가
    spawnFloatingText(x, y - player.radius - 6, '+0.3!', '#ffe600');
    if (!feverActive) {
        feverGauge += FEVER_STEP;
        grazeIdleTimer = 0;
        if (feverGauge >= 1) { feverGauge = 1; activateFever(); }
    }
}
function activateFever() {
    feverActive = true;
    feverTimer = 0;
    [...lasers, ...spikes, ...missiles, ...saws].forEach(o => { o.feverTouched = false; });
    spawnFloatingText(canvas.width / 2, 150, 'FEVER TIME!', '#00ff66', true);
}
// fever 중 초록 장애물 접촉 시 0.1초 추가 (장애물당 1회)
function feverTouch(obs) {
    if (obs.feverTouched) return;
    obs.feverTouched = true;
    score += 0.1;
    spawnFloatingText(player.x, player.y - player.radius - 6, '+0.1!', '#00ff66');
}
// 살아있을 때 한 장애물에 대해 충돌/미세회피 처리
function handleObstacle(obs) {
    if (!isPlaying || isDying) return;
    if (obs.checkCollision(player.x, player.y, player.radius)) {
        if (feverActive) feverTouch(obs);
        else startDeathSequence();
    } else if (!obs.grazed && obs.checkGraze(player.x, player.y, player.radius)) {
        obs.grazed = true;
        onGraze(player.x, player.y);
    }
}

// 상단 중앙 Fever 게이지 UI
function drawFeverUI() {
    let w = 220, h = 16;
    let x = canvas.width / 2 - w / 2, y = 18;
    ctx.save();
    ctx.textAlign = 'center';
    // 라벨
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.fillStyle = feverActive ? '#00ff66' : '#ffcc00';
    ctx.shadowBlur = feverActive ? 12 : 0; ctx.shadowColor = '#00ff66';
    ctx.fillText(feverActive ? '🔥 FEVER 🔥' : 'FEVER', canvas.width / 2, y - 4);
    ctx.shadowBlur = 0;
    // 배경 트랙
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x, y, w, h);
    // 채움
    if (feverActive) {
        let remain = Math.max(0, 1 - feverTimer / FEVER_DURATION_MS);
        let hue = (performance.now() / 6) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 55%)`;
        ctx.shadowBlur = 14; ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(x, y, w * remain, h);
    } else {
        ctx.fillStyle = '#ffcc00';
        ctx.shadowBlur = 8; ctx.shadowColor = '#ffcc00';
        ctx.fillRect(x, y, w * feverGauge, h);
    }
    ctx.shadowBlur = 0;
    // 12칸 분할선
    if (!feverActive) {
        ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 2;
        for (let i = 1; i < 12; i++) {
            let sx = x + (w / 12) * i;
            ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx, y + h); ctx.stroke();
        }
    }
    // 외곽선
    ctx.strokeStyle = feverActive ? '#00ff66' : 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
}

// [Advanced] Geometry Dash Style Ribbon Trail Drawer
function drawRibbonTrail() {
    // 별가루/벚꽃은 리본 대신 뒤로 쏟아지는 파티클을 사용하므로 리본 미사용
    // 리본형(none/rainbow/flame/lightning)만 리본을 그림 — 나머지는 파티클 트레일
    if (!['none', 'rainbow', 'flame', 'lightning', 'spark'].includes(currentTrailId)) return;
    if (trailHistory.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTrailId === 'rainbow') { drawRainbowLayers(); ctx.restore(); return; }
    if (currentTrailId === 'flame') { drawFlameTrail(); ctx.restore(); return; }
    if (currentTrailId === 'lightning') { drawLightningTrail(); ctx.restore(); return; }
    if (currentTrailId === 'spark') { drawSparkLightning(); ctx.restore(); return; }

    // 기본(none): 민트 리본
    for (let i = 1; i < trailHistory.length; i++) {
        let p1 = trailHistory[i - 1];
        let p2 = trailHistory[i];
        let ratio = i / trailHistory.length;
        ctx.lineWidth = player.radius * 1.3 * ratio;
        let alpha = 0.75 * ratio;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(0, 255, 204, ${alpha * 0.4})`;
        ctx.shadowBlur = 4; ctx.shadowColor = '#00ffcc';
        ctx.stroke();
    }
    ctx.restore();
}

// High-Fi Cinematic Death Particle Spawner
function triggerDeathExplosion(px, py) {
    // 번개: 지지직거리는 번개 줄기가 사방으로 터짐
    if (currentDieEffectId === 'thunder') { startThunderDeath(px, py); return; }
    // 벚꽃: 꽃잎이 터져나오고 화면 가장자리에 벚꽃나무가 피어남
    if (currentDieEffectId === 'cherry') { spawnCherryDeath(px, py); return; }

    let pCount = 55;
    let speedScale = 0.85; // 더 넓게 퍼지게

    for (let i = 0; i < pCount; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = (0.6 + Math.random() * 3.2) * speedScale;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;

        let color, size, life = 700 + Math.random() * 600;

        if (currentDieEffectId === 'bomb') {
            color = Math.random() > 0.5 ? '#ff4500' : (Math.random() > 0.25 ? '#ffcc00' : '#222');
            size = 4 + Math.random() * 7;
        } else { // fire
            color = Math.random() > 0.4 ? '#ff3300' : '#ff9900';
            size = 4 + Math.random() * 5;
            life = 900 + Math.random() * 400;
        }

        particles.push(new Particle(px, py, vx, vy, color, size, life));
    }
}

function updateMousePos(e) {
    let clientX, clientY;
    if (e.touches) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = e.clientX; clientY = e.clientY; }
    player.targetX = clientX; player.targetY = clientY;
}
window.addEventListener('mousemove', updateMousePos);
window.addEventListener('touchmove', updateMousePos, { passive: false });
