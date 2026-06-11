// ===== g-obstacles.js : 장애물 클래스(Laser/Spike/HomingMissile/TimedSaw) =====
// [Obstacle 1] Laser Class
class Laser {
    constructor() {
        this.side = Math.floor(Math.random() * 4); 
        this.warningTime = Math.max(180, 900 - (level * 80)); 
        this.duration = 400; 
        this.age = 0;
        this.isFired = false;
        this.thickness = 16 + (level * 3); 

        if (this.side === 0 || this.side === 2) {
            this.type = 'horizontal'; this.y = Math.random() * canvas.height; this.x = 0;
        } else {
            this.type = 'vertical'; this.x = Math.random() * canvas.width; this.y = 0;
        }
    }
    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.warningTime) this.isFired = true;
    }
    draw() {
        ctx.save();
        if (!this.isFired) {
            ctx.strokeStyle = feverActive ? 'rgba(0, 255, 102, 0.6)' : 'rgba(255, 30, 30, 0.6)';
            ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
            ctx.beginPath();
            if (this.type === 'horizontal') { ctx.moveTo(0, this.y); ctx.lineTo(canvas.width, this.y); }
            else { ctx.moveTo(this.x, 0); ctx.lineTo(this.x, canvas.height); }
            ctx.stroke();
        } else {
            let alpha = 1 - (this.age - this.warningTime) / this.duration;
            if (alpha < 0) alpha = 0;
            ctx.shadowBlur = 6; ctx.shadowColor = feverActive ? '#00ff66' : '#ff0055';
            ctx.fillStyle = feverActive ? `rgba(0, 255, 102, ${alpha})` : `rgba(255, 0, 85, ${alpha})`;
            if (this.type === 'horizontal') {
                ctx.fillRect(0, this.y - this.thickness/2, canvas.width, this.thickness);
            } else {
                ctx.fillRect(this.x - this.thickness/2, 0, this.thickness, canvas.height);
            }
        }
        ctx.restore();
    }
    checkCollision(px, py, pr) {
        if (!this.isFired) return false;
        if (this.type === 'horizontal') {
            return (py + pr > this.y - this.thickness/2 && py - pr < this.y + this.thickness/2);
        } else {
            return (px + pr > this.x - this.thickness/2 && px - pr < this.x + this.thickness/2);
        }
    }
    checkGraze(px, py, pr) {
        if (!this.isFired) return false;
        let inner = this.thickness / 2 + pr;
        let d = this.type === 'horizontal' ? Math.abs(py - this.y) : Math.abs(px - this.x);
        return d >= inner && d < inner + GRAZE_MARGIN;
    }
}

// [Obstacle 2] Spike Class
class Spike {
    constructor() {
        this.type = Math.random() > 0.5 ? 'topToBottom' : 'rightToLeft';
        this.size = 12 + Math.random() * 8;
        let baseSpeed = this.type === 'topToBottom' ? 0.28 : 0.33;
        this.speed = baseSpeed + (level * 0.05); 

        if (this.type === 'topToBottom') { this.x = Math.random() * canvas.width; this.y = -this.size * 2; }
        else { this.x = canvas.width + this.size * 2; this.y = Math.random() * canvas.height; }
        this.color = '#ff9900';
    }
    update(deltaTime) {
        if (this.type === 'topToBottom') this.y += this.speed * deltaTime;
        else this.x -= this.speed * deltaTime;
    }
    draw() {
        let col = feverActive ? '#00ff66' : this.color;
        ctx.save(); ctx.fillStyle = col; ctx.shadowBlur = 0;
        ctx.beginPath();
        if (this.type === 'topToBottom') {
            ctx.moveTo(this.x, this.y + this.size); ctx.lineTo(this.x - this.size, this.y - this.size); ctx.lineTo(this.x + this.size, this.y - this.size);
        } else {
            ctx.moveTo(this.x - this.size, this.y); ctx.lineTo(this.x + this.size, this.y - this.size); ctx.lineTo(this.x + this.size, this.y + this.size);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
    }
    checkCollision(px, py, pr) {
        let dx = this.x - px; let dy = this.y - py;
        return Math.sqrt(dx * dx + dy * dy) < (this.size * 0.8) + pr;
    }
    checkGraze(px, py, pr) {
        let dx = this.x - px, dy = this.y - py;
        let d = Math.sqrt(dx * dx + dy * dy);
        let inner = (this.size * 0.8) + pr;
        return d >= inner && d < inner + GRAZE_MARGIN;
    }
    isOutOfBounds() {
        if (this.type === 'topToBottom') return this.y > canvas.height + this.size * 2;
        return this.x < -this.size * 2;
    }
}

// [Obstacle 3] Homing Missile Class
class HomingMissile {
    constructor() {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { this.x = Math.random() * canvas.width; this.y = -20; }
        else if (edge === 1) { this.x = canvas.width + 20; this.y = Math.random() * canvas.height; }
        else if (edge === 2) { this.x = Math.random() * canvas.width; this.y = canvas.height + 20; }
        else { this.x = -20; this.y = Math.random() * canvas.height; }

        this.size = 10; this.speed = 0.18 + (level * 0.02);
        this.homingTime = 1800; this.age = 0; this.vx = 0; this.vy = 0;
    }
    update(deltaTime) {
        this.age += deltaTime;
        if (this.age < this.homingTime && isPlaying && !isDying) {
            let dx = player.x - this.x; let dy = player.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) { this.vx = (dx / dist) * this.speed; this.vy = (dy / dist) * this.speed; }
        }
        this.x += this.vx * deltaTime; this.y += this.vy * deltaTime;
    }
    draw() {
        ctx.save();
        if (feverActive) {
            ctx.fillStyle = (Math.floor(this.age / 100) % 2 === 0) ? '#aaffcc' : '#00ff66'; ctx.shadowColor = '#00ff66';
        } else {
            ctx.fillStyle = '#ff0033'; ctx.shadowColor = '#ff0033';
            if (this.age < this.homingTime && Math.floor(this.age / 100) % 2 === 0) ctx.fillStyle = '#ffcc00';
        }
        ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2); ctx.restore();
    }
    checkCollision(px, py, pr) {
        let dx = this.x - px; let dy = this.y - py;
        return Math.sqrt(dx * dx + dy * dy) < this.size + pr;
    }
    checkGraze(px, py, pr) {
        let dx = this.x - px, dy = this.y - py;
        let d = Math.sqrt(dx * dx + dy * dy);
        let inner = this.size + pr;
        return d >= inner && d < inner + GRAZE_MARGIN;
    }
    isOutOfBounds() { return (this.x < -50 || this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50); }
}

// [Obstacle 4] Timed Spawn Saw Class
class TimedSaw {
    constructor() {
        this.x = 40 + Math.random() * (canvas.width - 80);
        this.y = 40 + Math.random() * (canvas.height - 80);
        this.size = 18 + Math.random() * 6; this.angle = 0;
        this.rotSpeed = 0.008 + (level * 0.001); this.lifeTime = 5000; this.age = 0;
    }
    update(deltaTime) { this.age += deltaTime; this.angle += this.rotSpeed * deltaTime; }
    draw() {
        ctx.save();
        let isExpiring = (this.lifeTime - this.age) < 1000;
        if (isExpiring && Math.floor(this.age / 80) % 2 === 0) { ctx.restore(); return; }
        if (feverActive) {
            ctx.strokeStyle = '#00ff66'; ctx.fillStyle = '#003a1e'; ctx.shadowColor = '#00ff66';
        } else {
            ctx.strokeStyle = '#b300ff'; ctx.fillStyle = '#1e003a'; ctx.shadowColor = '#b300ff';
        }
        ctx.lineWidth = 3.5; ctx.shadowBlur = 6;
        ctx.beginPath();
        const toothCount = 10;
        for (let i = 0; i < toothCount; i++) {
            let a = this.angle + (Math.PI * 2 / toothCount) * i;
            let x1 = this.x + Math.cos(a) * this.size; let y1 = this.y + Math.sin(a) * this.size;
            let x2 = this.x + Math.cos(a + 0.3) * (this.size * 0.55); let y2 = this.y + Math.sin(a + 0.3) * (this.size * 0.55);
            if (i === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = feverActive ? '#88ffbb' : '#ff00ff'; ctx.beginPath(); ctx.arc(this.x, this.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    checkCollision(px, py, pr) {
        let dx = this.x - px; let dy = this.y - py;
        return Math.sqrt(dx * dx + dy * dy) < (this.size * 0.85) + pr;
    }
    checkGraze(px, py, pr) {
        let dx = this.x - px, dy = this.y - py;
        let d = Math.sqrt(dx * dx + dy * dy);
        let inner = (this.size * 0.85) + pr;
        return d >= inner && d < inner + GRAZE_MARGIN;
    }
    isExpired() { return this.age >= this.lifeTime; }
}
