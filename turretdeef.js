const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Game state
const turrets = [];
const enemies = [];
let money = 100;
let score = 0;
let selectedTurretType = "basic";
let gameRunning = true;

// Turret types
const turretTypes = {
    basic: { cost: 50, range: 100, cooldown: 50, damage: 10, color: 'blue' },
    sniper: { cost: 100, range: 200, cooldown: 100, damage: 30, color: 'green' },
    rapid: { cost: 75, range: 80, cooldown: 20, damage: 5, color: 'yellow' },
};

// Turret class
class Turret {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.range = turretTypes[type].range;
        this.cooldown = 0;
        this.damage = turretTypes[type].damage;
        this.color = turretTypes[type].color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
        ctx.stroke();
    }

    shoot(enemy) {
        if (this.cooldown <= 0 && this.inRange(enemy)) {
            this.cooldown = turretTypes[this.type].cooldown;
            enemy.hp -= this.damage;
        }
    }

    inRange(enemy) {
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.range;
    }

    update() {
        if (this.cooldown > 0) {
            this.cooldown--;
        }
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hp = 100;
        this.speed = 1;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
        ctx.fillStyle = 'grey';
        ctx.fillText(this.hp, this.x - 10, this.y - 15);
    }

    update() {
        this.x += this.speed;
    }
}

// Event listener for placing turrets
canvas.addEventListener('click', (e) => {
    if (money >= turretTypes[selectedTurretType].cost) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        turrets.push(new Turret(x, y, selectedTurretType));
        money -= turretTypes[selectedTurretType].cost;
    }
});

// UI for turret selection
function drawUI() {
    const turretNames = Object.keys(turretTypes);
    ctx.fillStyle = "grey";
    ctx.fillText("Select a turret:", 10, 50);

    turretNames.forEach((type, index) => {
        const turret = turretTypes[type];
        ctx.fillStyle = turret.color;
        ctx.fillRect(10, 60 + index * 40, 20, 20);
        ctx.fillStyle = "grey";
        ctx.fillText(
            `${type} (${turret.cost}$)`,
            40,
            75 + index * 40
        );
    });
}

// Select turret type based on mouse position over UI
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const turretNames = Object.keys(turretTypes);
    turretNames.forEach((type, index) => {
        if (x >= 10 && x <= 30 && y >= 60 + index * 40 && y <= 80 + index * 40) {
            selectedTurretType = type;
        }
    });
});

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw and update enemies
    for (let enemy of enemies) {
        enemy.update();
        enemy.draw();
    }

    // Draw and update turrets
    for (let turret of turrets) {
        turret.update();
        turret.draw();

        for (let enemy of enemies) {
            if (enemy.hp > 0) {
                turret.shoot(enemy);
            }
        }
    }

    // Remove defeated enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= 0) {
            enemies.splice(i, 1);
            score += 10;
            money += 20;
        } else if (enemies[i].x > canvas.width) {
            gameRunning = false;
            alert("Game Over! Final Score: " + score);
        }
    }

    // Draw UI
    drawUI();

    // Display stats
    ctx.fillStyle = "grey";
    ctx.fillText(`Score: ${score} | Money: ${money}`, 10, 20);

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Spawn enemies at intervals
setInterval(() => {
    if (gameRunning) {
        enemies.push(new Enemy(0, Math.random() * canvas.height));
    }
}, 2000);

// Start the game
gameLoop();
