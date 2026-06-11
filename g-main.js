// ===== g-main.js : 메인 루프/사망시퀀스/랭킹/UI생성/시작·리셋/이벤트연결 =====
// Main Game Frame Loop
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 극적인 연출을 위한 시네마틱 시간 배율 (전기 사망은 빠릿하게 진행하므로 슬로우모션 제외)
    let timeScale = (isDying && currentDieEffectId !== 'thunder') ? 0.35 : 1.0;
    let effDelta = deltaTime * timeScale;
    // 전기 사망 컨트롤러(0.1초 멈춤 → 벽 2번 튕김 → 큰 폭발)는 실시간으로 진행
    if (isDying && thunderDeath) updateThunderDeath(deltaTime);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 화면 흔들림 적용 (이후 모든 드로잉에 적용, 맨 끝에서 복원)
    ctx.save();
    if (shakeTime > 0) {
        shakeTime -= deltaTime;
        let m = shakeMag * Math.max(0, shakeTime / shakeDur);
        ctx.translate((Math.random() - 0.5) * 2 * m, (Math.random() - 0.5) * 2 * m);
    }

    // 1. 트레일 리본 그리기 (살아있거나 죽어가는 모션 중에만 꼬리 추적 유지)
    if (isPlaying || isDying) {
        drawRibbonTrail();
    }

    // 2. 파티클(사망 폭발) 시스템 업데이트 및 렌더링
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(effDelta);
        particles[i].draw();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // 2-1~2-3. 커스텀 이펙트 렌더링 (어떤 경우에도 메인 루프가 멈추지 않도록 보호)
    try {
        // 별가루/벚꽃 트레일 파티클
        for (let i = trailParticles.length - 1; i >= 0; i--) {
            trailParticles[i].update(effDelta);
            trailParticles[i].draw();
            if (trailParticles[i].life <= 0) trailParticles.splice(i, 1);
        }
        // 번개 사망 줄기 (지지직)
        for (let i = deathBolts.length - 1; i >= 0; i--) {
            deathBolts[i].update(effDelta);
            deathBolts[i].draw();
            if (deathBolts[i].life <= 0) deathBolts.splice(i, 1);
        }
        // 벚꽃나무 (가장자리에서 피어남)
        for (let i = cherryTrees.length - 1; i >= 0; i--) {
            cherryTrees[i].update(effDelta);
            cherryTrees[i].draw();
            if (cherryTrees[i].life <= 0) cherryTrees.splice(i, 1);
        }
    } catch (err) {
        console.error('effect render error:', err);
        trailParticles = []; deathBolts = []; cherryTrees = [];
    }

    // 3. 사망 모션 중 백그라운드 타이머 작동 제어
    if (isDying) {
        dieTimer += deltaTime; // 실제 시간 기준으로 타이머 체크
        if (dieTimer >= deathDuration) {
            isDying = false;
            executeGameOverScreen(); // 연출 종료 후 자연스럽게 게임오버 스크린 호출
        }
    }

    if (isPlaying && !isDying) {
        // Fever 상태 갱신
        if (feverActive) {
            feverTimer += deltaTime;
            if (feverTimer >= FEVER_DURATION_MS) { feverActive = false; feverGauge = 0; } // 10초 후 초기화
        } else if (feverGauge > 0) {
            grazeIdleTimer += deltaTime;
            if (grazeIdleTimer > FEVER_RESET_MS) feverGauge = 0; // 5초간 추가 미세 회피 없으면 게이지 초기화
        }

        // 스코어링 시스템
        score += deltaTime / 1000;
        scoreUi.innerText = `SCORE: ${score.toFixed(1)}s`;
        
        let newLevel = Math.floor(score / 10) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelUi.innerText = `LEVEL: ${level} (DANGER: ${'★'.repeat(Math.min(level, 8))})`;
        }

        // 캐릭터 보간식 추적 이동
        let prevPX = player.x, prevPY = player.y;
        player.x += (player.targetX - player.x) * player.speed;
        player.y += (player.targetY - player.y) * player.speed;
        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
        player.vx = player.x - prevPX;
        player.vy = player.y - prevPY;

        // 지오메트리대쉬형 실시간 경로 스냅샷 기록 추가
        trailHistory.push({ x: player.x, y: player.y, time: performance.now() });
        if (trailHistory.length > 25) { // 꼬리 최대 길이
            trailHistory.shift();
        }

        // 별가루/벚꽃 트레일: 기존 리본 대신 움직임 뒤로 파티클을 쏟아냄
        let moveSpeed = Math.hypot(player.vx, player.vy);
        if (moveSpeed > 0.4) {
            let n = Math.min(3, 1 + Math.floor(moveSpeed / 3));
            if (currentTrailId === 'star') {
                for (let k = 0; k < n; k++) spawnTrailStar(player.x, player.y, player.vx, player.vy);
            } else if (currentTrailId === 'cherry') {
                for (let k = 0; k < n; k++) spawnTrailPetal(player.x, player.y, player.vx, player.vy);
            } else if (currentTrailId === 'pixel') {
                for (let k = 0; k < n; k++) spawnTrailItem(player.x, player.y, player.vx, player.vy, 'pixel');
            } else if (currentTrailId === 'plasma') {
                for (let k = 0; k < Math.min(2, n); k++) spawnTrailItem(player.x, player.y, player.vx, player.vy, 'plasma', 1.0, 0.02, 0.06);
            }
        }

        // 장애물 생성 스케줄러 (쉬는 시간 없음, 난이도 소폭 상향)
        obstacleTimer += deltaTime;
        let spawnInterval = Math.max(120, 470 - (level * 38));

        if (obstacleTimer >= spawnInterval) {
            // 0~12초: 레이저+가시 / 12초~: 미사일 / 24초~: 톱날
            let canMissile = score >= 12;
            let canSaw = score >= 24;
            let rand = Math.random();
            if (rand < 0.4) lasers.push(new Laser());
            else if (rand < 0.74) spikes.push(new Spike());
            else if (rand < 0.9 && canMissile) missiles.push(new HomingMissile());
            else if (canSaw) saws.push(new TimedSaw());
            else spikes.push(new Spike()); // 아직 해금 전이면 가시로 대체
            obstacleTimer = 0;
        }
    }

    // 장애물들의 주기 처리 (사망 연출 상태에서도 멈추지 않고 부드럽게 흐름)
    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].update(effDelta); lasers[i].draw();
        handleObstacle(lasers[i]);
        if (lasers[i].age >= lasers[i].warningTime + lasers[i].duration) lasers.splice(i, 1);
    }
    for (let i = spikes.length - 1; i >= 0; i--) {
        spikes[i].update(effDelta); spikes[i].draw();
        handleObstacle(spikes[i]);
        if (spikes[i].isOutOfBounds()) spikes.splice(i, 1);
    }
    for (let i = missiles.length - 1; i >= 0; i--) {
        missiles[i].update(effDelta); missiles[i].draw();
        handleObstacle(missiles[i]);
        if (missiles[i].isOutOfBounds()) missiles.splice(i, 1);
    }
    for (let i = saws.length - 1; i >= 0; i--) {
        saws[i].update(effDelta); saws[i].draw();
        handleObstacle(saws[i]);
        if (saws[i].isExpired()) saws.splice(i, 1);
    }

    // 플레이어가 살아있을 때만 캐릭터 스프라이트 본체 렌더링
    if (isPlaying && !isDying) {
        const activeSkin = skins.find(s => s.id === currentSkinId);
        drawSlime(ctx, player.x, player.y, player.radius, activeSkin, player.vx, player.vy);
    } else if (thunderDeath) {
        // 전기 사망 중: 튕기는 슬라임을 전기 오라와 함께 렌더
        const activeSkin = skins.find(s => s.id === currentSkinId);
        ctx.save();
        ctx.shadowBlur = 18; ctx.shadowColor = '#bbffff';
        if (thunderDeath.phase === 'freeze' && Math.floor(thunderDeath.timer / 30) % 2 === 0) ctx.globalAlpha = 0.5; // 멈춤 중 깜빡임
        drawSlime(ctx, thunderDeath.x, thunderDeath.y, player.radius, activeSkin);
        ctx.restore();
    }

    // 떠오르는 문구(+0.3! / +0.1! / FEVER!) 업데이트 & 렌더
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].update(effDelta);
        floatingTexts[i].draw();
        if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }

    // 상단 중앙 Fever 게이지 (플레이 중에만 표시)
    if (isPlaying || isDying) drawFeverUI();

    ctx.restore(); // 화면 흔들림 변환 복원

    requestAnimationFrame(gameLoop);
}

// 1단계: 부딪혔을 때 슬로우 모션 및 폭발 연출 시작 모듈
function startDeathSequence() {
    isDying = true;
    dieTimer = 0;
    // 벚꽃은 나무가 부드럽게 만개하는 모습을 보여주기 위해 사망 연출을 더 길게
    deathDuration = (currentDieEffectId === 'cherry') ? 2100 : (currentDieEffectId === 'thunder') ? 1500 : 1200;
    triggerDeathExplosion(player.x, player.y); // 커스텀 화려한 이펙트 폭발
}

// 2단계: 사망 연출이 종료된 후 최종 호출되는 UI 팝업 모듈
function executeGameOverScreen() {
    isPlaying = false;
    // 게임오버 화면 뒤에서 무거운 사망 이펙트가 계속 렌더링되어 버벅이지 않도록 정리
    particles = []; trailParticles = []; deathBolts = []; cherryTrees = []; trailHistory = [];
    thunderDeath = null;
    finalScoreUi.innerText = `Survived: ${score.toFixed(1)}s`;
    saveAndDisplayRanking(playerName, score);

    // ===== Coin rewards =====
    let survived = Math.floor(score);
    coins += survived;                       // 1s survived = 1 coin
    totalPlays++;
    let lines = [`Survival: +${survived} 🪙`];
    if (totalPlays % 5 === 0) { coins += 50; lines.push('Play Bonus (every 5): +50 🪙'); }
    ACHIEVEMENTS.forEach(a => {
        if (!achDone[a.id] && a.test()) { achDone[a.id] = true; coins += a.reward; lines.push(`Achievement "${a.name}": +${a.reward} 🪙`); }
    });
    saveEconomy(); refreshCurrency();
    document.getElementById('reward-line').innerHTML = lines.join('<br>');
    currencyBar.style.display = 'flex';

    gameOverScreen.classList.remove('hidden');
}

// Leaderboard Ranking Storage
function saveAndDisplayRanking(currentName, currentScore) {
    let rankings = JSON.parse(localStorage.getItem('borderHopperGlobalRank')) || [];
    rankings.push({ name: currentName, score: parseFloat(currentScore.toFixed(1)) });
    rankings.sort((a, b) => b.score - a.score);
    rankings = rankings.slice(0, 5); 
    localStorage.setItem('borderHopperGlobalRank', JSON.stringify(rankings));
    
    rankingListUi.innerHTML = '';
    rankings.forEach((item, index) => {
        const isTop = index === 0 ? 'top' : '';
        const rankElement = document.createElement('div');
        rankElement.className = `ranking-item ${isTop}`;
        rankElement.innerHTML = `<span>Rank ${index + 1}. ${item.name}</span><span>${item.score}s</span>`;
        rankingListUi.appendChild(rankElement);
    });
}

// UI Generator: Skin Shop
function generateSkinShop() {
    skinContainer.innerHTML = '';
    skins.forEach(skin => {
        const isEquipped = skin.id === currentSkinId;
        const owned = isOwned('skin', skin.id);
        const card = document.createElement('div');
        card.className = `skin-card ${isEquipped ? 'equipped' : ''} ${owned ? '' : 'locked'}`;

        const shopCanvas = document.createElement('canvas');
        shopCanvas.className = 'skin-preview-canvas';
        shopCanvas.width = 85; shopCanvas.height = 85;

        const nameLabel = document.createElement('div');
        nameLabel.className = 'skin-name'; nameLabel.innerText = skin.name;

        const equipBtn = document.createElement('button');
        equipBtn.className = `btn-equip ${(isEquipped || !owned) ? '' : 'active'}`;
        equipBtn.innerText = !owned ? '🔒 LOCKED' : (isEquipped ? 'EQUIPPED' : 'EQUIP');
        equipBtn.disabled = isEquipped || !owned;

        if (owned && !isEquipped) {
            equipBtn.onclick = () => { currentSkinId = skin.id; generateSkinShop(); };
        }
        card.appendChild(shopCanvas); card.appendChild(nameLabel); card.appendChild(equipBtn);
        skinContainer.appendChild(card);

        const sCtx = shopCanvas.getContext('2d');
        sCtx.clearRect(0, 0, 85, 85);
        drawSlime(sCtx, 42, 43, 16, skin);
    });
}

// UI Generator: Edit Tab Option Grid
function generateEditOptions() {
    dieEffectsGrid.innerHTML = '';
    dieEffects.forEach(effect => {
        const isSelected = effect.id === currentDieEffectId;
        const owned = isOwned('death', effect.id);
        const card = document.createElement('div');
        card.className = `opt-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `<div class="opt-preview">${effect.icon}</div><div class="opt-name">${owned ? effect.name : '🔒 ' + effect.name}</div>`;
        if (owned) card.onclick = () => { currentDieEffectId = effect.id; generateEditOptions(); };
        else card.style.opacity = '0.45';
        dieEffectsGrid.appendChild(card);
    });

    trailsGrid.innerHTML = '';
    trailEffects.forEach(trail => {
        const isSelected = trail.id === currentTrailId;
        const owned = isOwned('trail', trail.id);
        const card = document.createElement('div');
        card.className = `opt-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `<div class="opt-preview">${trail.icon}</div><div class="opt-name">${owned ? trail.name : '🔒 ' + trail.name}</div>`;
        if (owned) card.onclick = () => { currentTrailId = trail.id; generateEditOptions(); };
        else card.style.opacity = '0.45';
        trailsGrid.appendChild(card);
    });
}

function startGame() {
    let inputName = usernameInput.value.trim();
    if (!inputName) { alert("Please enter your name!"); return; }
    playerName = inputName;
    startScreen.classList.add('hidden');
    resetGame();
}

function resetGame() {
    isPlaying = true;
    isDying = false;
    dieTimer = 0;
    score = 0; level = 1; obstacleTimer = 0;
    nextRestAt = 15; restEndScore = 0;
    lasers = []; spikes = []; missiles = []; saws = []; particles = []; trailHistory = [];
    trailParticles = []; deathBolts = []; cherryTrees = []; floatingTexts = []; thunderDeath = null;
    feverGauge = 0; feverActive = false; feverTimer = 0; grazeIdleTimer = 0; shakeTime = 0;
    player.x = window.innerWidth / 2; player.y = window.innerHeight / 2;
    player.targetX = window.innerWidth / 2; player.targetY = window.innerHeight / 2;
    
    scoreUi.innerText = `SCORE: 0.0s`;
    levelUi.innerText = `LEVEL: 1 (HELL MODE)`;
    gameOverScreen.classList.add('hidden');
    currencyBar.style.display = 'none'; // 플레이 중엔 통화 숨김
    lastTime = performance.now();
}

// Window Event Controls Map
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);

mainShopBtn.addEventListener('click', () => { lastScreen = 'start'; startScreen.classList.add('hidden'); generateSkinShop(); skinScreen.classList.remove('hidden'); });
deadShopBtn.addEventListener('click', () => { lastScreen = 'gameover'; gameOverScreen.classList.add('hidden'); generateSkinShop(); skinScreen.classList.remove('hidden'); });

mainEditBtn.addEventListener('click', () => { lastScreen = 'start'; startScreen.classList.add('hidden'); generateEditOptions(); editScreen.classList.remove('hidden'); });
deadEditBtn.addEventListener('click', () => { lastScreen = 'gameover'; gameOverScreen.classList.add('hidden'); generateEditOptions(); editScreen.classList.remove('hidden'); });

backSkinBtn.addEventListener('click', () => { skinScreen.classList.add('hidden'); if (lastScreen === 'start') startScreen.classList.remove('hidden'); else gameOverScreen.classList.remove('hidden'); });
backEditBtn.addEventListener('click', () => { editScreen.classList.add('hidden'); if (lastScreen === 'start') startScreen.classList.remove('hidden'); else gameOverScreen.classList.remove('hidden'); });

usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') startGame(); });

// ===== Economy: persistence, box, shard shop, daily reward =====
const currencyBar = document.getElementById('currency-bar');
const shopScreen = document.getElementById('shop-screen');
const boxReveal = document.getElementById('box-reveal');
let revealTimer = null;
function showReveal(html) {
    boxReveal.innerHTML = html;
    boxReveal.classList.remove('hidden', 'show');
    void boxReveal.offsetWidth;
    boxReveal.classList.add('show');
    clearTimeout(revealTimer);
    revealTimer = setTimeout(() => boxReveal.classList.add('hidden'), 1900);
}
function triggerShopShake() {
    shopScreen.classList.remove('shaking');
    void shopScreen.offsetWidth;
    shopScreen.classList.add('shaking');
}

// ===== Accounts (client-side; NOT secure — real money needs a server) =====
function hashPw(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return '' + h; }
function loadAccounts() { try { accounts = JSON.parse(localStorage.getItem('bhAccounts')) || {}; } catch (e) { accounts = {}; } }
function saveAccounts() { localStorage.setItem('bhAccounts', JSON.stringify(accounts)); }

function loadEconomy() {
    let d = (currentUser && accounts[currentUser]) ? accounts[currentUser].economy : null;
    if (d) { coins = d.coins || 0; shards = d.shards || 0; ownedItems = d.owned || {}; totalPlays = d.plays || 0; dailyStreak = d.streak || 0; lastDailyDate = d.lastDaily || ''; achDone = d.ach || {}; }
    else { coins = 0; shards = 0; ownedItems = {}; totalPlays = 0; dailyStreak = 0; lastDailyDate = ''; achDone = {}; }
    ownedItems['skin:default'] = ownedItems['trail:none'] = ownedItems['death:bomb'] = true; // 기본 제공
}
function saveEconomy() {
    if (!currentUser) return;
    if (!accounts[currentUser]) accounts[currentUser] = { pw: '', economy: {} };
    accounts[currentUser].economy = { coins, shards, owned: ownedItems, plays: totalPlays, streak: dailyStreak, lastDaily: lastDailyDate, ach: achDone };
    saveAccounts();
}
function refreshCurrency() {
    document.getElementById('coin-amt').innerText = '🪙 ' + coins;
    document.getElementById('shard-amt').innerText = '💠 ' + shards;
}
function ownKey(type, id) { return type + ':' + id; }
function isOwned(type, id) { return !!ownedItems[ownKey(type, id)]; }
function unlock(type, id) { ownedItems[ownKey(type, id)] = true; }

// 잠금 가능한 모든 아이템 (기본 제공 제외)
function allItems() {
    let list = [];
    skins.forEach(s => { if (s.id !== 'default') list.push({ type: 'skin', id: s.id, name: s.name, icon: '🟢' }); });
    trailEffects.forEach(t => { if (t.id !== 'none') list.push({ type: 'trail', id: t.id, name: t.name + ' Trail', icon: t.icon }); });
    dieEffects.forEach(d => { if (d.id !== 'bomb') list.push({ type: 'death', id: d.id, name: d.name + ' Death', icon: d.icon }); });
    return list;
}
// 카테고리(skin/death/trail) 상자를 열어 해당 종류 중 하나를 확률적으로 획득
function openBox(cat) {
    if (coins < BOX_PRICE) { showReveal('<div class="rv-text">Not enough coins!</div>'); return; }
    coins -= BOX_PRICE;
    let pool = allItems().filter(it => it.type === cat);
    let pick = pool[Math.floor(Math.random() * pool.length)];
    let dup = isOwned(pick.type, pick.id);
    if (dup) shards += DUP_SHARDS; else unlock(pick.type, pick.id);
    saveEconomy(); refreshCurrency(); generateShop();
    triggerShopShake();
    if (dup) showReveal(`<div class="rv-icon">${pick.icon} 💠</div><div class="rv-text">Duplicate!\n+${DUP_SHARDS} Mileage</div>`);
    else showReveal(`<div class="rv-icon">${pick.icon}</div><div class="rv-text">Unlocked!\n${pick.name}</div>`);
}
function buyItem(type, id) {
    if (isOwned(type, id)) return;
    if (shards < SHARD_PRICE) { showReveal('<div class="rv-text">Not enough mileage!</div>'); return; }
    shards -= SHARD_PRICE; unlock(type, id); saveEconomy(); refreshCurrency(); generateShop();
}
// 실제 결제는 결제대행(PG) 연동이 필요하므로 여기서는 시뮬레이션 결제로 코인 지급
const COIN_PACKS = [{ coins: 500, won: 1000 }, { coins: 1000, won: 1900 }, { coins: 3000, won: 2900 }];
function buyCoins(i) {
    let p = COIN_PACKS[i];
    if (!p) return;
    if (!confirm(`Purchase ${p.coins} coins for ₩${p.won.toLocaleString()}?\n(Simulated payment — no real charge)`)) return;
    coins += p.coins; saveEconomy(); refreshCurrency(); generateShop();
    showReveal(`<div class="rv-icon">🪙</div><div class="rv-text">+${p.coins} Coins!</div>`);
}
function generateShop() {
    document.querySelectorAll('.btn-openbox').forEach(b => b.disabled = coins < BOX_PRICE);
    const cont = document.getElementById('shop-container');
    cont.innerHTML = '';
    allItems().forEach(it => {
        const owned = isOwned(it.type, it.id);
        const row = document.createElement('div');
        row.className = 'mileage-row';
        const label = document.createElement('span');
        label.innerText = `${it.icon} ${it.name}`;
        const btn = document.createElement('button');
        btn.className = `btn-equip ${owned ? '' : 'active'}`;
        btn.innerText = owned ? 'OWNED' : '150 💠';
        btn.disabled = owned;
        if (!owned) btn.onclick = () => buyItem(it.type, it.id);
        row.appendChild(label); row.appendChild(btn); cont.appendChild(row);
    });
}
function claimDaily() {
    let today = new Date().toDateString();
    if (lastDailyDate === today) return null;
    let yest = new Date(Date.now() - 86400000).toDateString();
    dailyStreak = (lastDailyDate === yest) ? dailyStreak + 1 : 1;
    lastDailyDate = today;
    let reward = 100 + (dailyStreak - 1) * 50;
    coins += reward; saveEconomy();
    return { day: dailyStreak, reward };
}
function showToast(msg) {
    let d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:absolute;top:64px;left:50%;transform:translateX(-50%);background:#1a1a24;color:#ffd23f;padding:10px 20px;border-radius:22px;font-weight:bold;z-index:20;border:1px solid #ffd23f;';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3800);
}

const mainBoxBtn = document.getElementById('btn-main-box');
const deadBoxBtn = document.getElementById('btn-dead-box');
const backShopBtn = document.getElementById('btn-back-shop');
function openShop(from) { lastScreen = from; (from === 'start' ? startScreen : gameOverScreen).classList.add('hidden'); boxReveal.classList.add('hidden'); boxReveal.innerHTML = ''; generateShop(); shopScreen.classList.remove('hidden'); shopScreen.scrollTop = 0; }
mainBoxBtn.addEventListener('click', () => openShop('start'));
deadBoxBtn.addEventListener('click', () => openShop('gameover'));
backShopBtn.addEventListener('click', () => { shopScreen.classList.add('hidden'); if (lastScreen === 'start') startScreen.classList.remove('hidden'); else gameOverScreen.classList.remove('hidden'); });
document.querySelectorAll('.btn-openbox').forEach(b => b.addEventListener('click', () => openBox(b.dataset.cat)));
document.querySelectorAll('.btn-buycoin').forEach(b => b.addEventListener('click', () => buyCoins(+b.dataset.i)));

// ===== Login / account flow =====
const loginScreen = document.getElementById('login-screen');
const loginUser = document.getElementById('login-user');
const loginPass = document.getElementById('login-pass');
const loginMsg = document.getElementById('login-msg');

function enterGame(user) {
    currentUser = user;
    localStorage.setItem('bhCurrentUser', user);
    loadEconomy();
    let daily = claimDaily();
    refreshCurrency();
    loginScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    currencyBar.style.display = 'flex';
    document.getElementById('welcome-line').innerText = 'Welcome, ' + user + '!';
    usernameInput.value = user.slice(0, 8);
    if (daily) showToast(`Daily Reward (Day ${daily.day}): +${daily.reward} 🪙`);
}
function doSignup() {
    let u = loginUser.value.trim(), p = loginPass.value;
    if (u.length < 2 || p.length < 2) { loginMsg.innerText = 'Username & password min 2 chars.'; return; }
    if (accounts[u]) { loginMsg.innerText = 'Username already taken.'; return; }
    accounts[u] = { pw: hashPw(p), economy: {} };
    saveAccounts();
    enterGame(u);
}
function doLogin() {
    let u = loginUser.value.trim(), p = loginPass.value;
    if (!accounts[u]) { loginMsg.innerText = 'No such account. Sign up first.'; return; }
    if (accounts[u].pw !== hashPw(p)) { loginMsg.innerText = 'Wrong password.'; return; }
    enterGame(u);
}
function doLogout() {
    saveEconomy();
    currentUser = null;
    localStorage.removeItem('bhCurrentUser');
    startScreen.classList.add('hidden');
    currencyBar.style.display = 'none';
    loginPass.value = '';
    loginMsg.innerText = '';
    loginScreen.classList.remove('hidden');
}
document.getElementById('btn-login').addEventListener('click', doLogin);
document.getElementById('btn-signup').addEventListener('click', doSignup);
document.getElementById('btn-logout').addEventListener('click', doLogout);
loginPass.addEventListener('keypress', (e) => { if (e.key === 'Enter') doLogin(); });

// 초기화: 계정 불러오기 → 자동 로그인 or 로그인 화면
loadAccounts();
let _last = localStorage.getItem('bhCurrentUser');
if (_last && accounts[_last]) enterGame(_last);
else { currencyBar.style.display = 'none'; }

requestAnimationFrame(gameLoop);
    
