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
    basic: { cost: 30, range: 150, cooldown: 50, damage: 15, color: 'blue' },
    sniper: { cost: 75, range: 300, cooldown: 100, damage: 40, color: 'green' },
    rapid: { cost: 50, range: 80, cooldown: 20, damage: 10, color: 'purple' },
};

// Turret class
class Turret {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.range = turretTypes[type].range;
        this.cooldown = turretTypes[type].cooldown;
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

// Enemy types
const enemyTypes = {
    basic: { value: 50, speed: 1, hp: 75, probability: 0.5, color: 'red' },
    heavy: { value: 100, speed: 0.5, hp: 150, probability: 0.3, color: 'orange' },
    quick: { value: 75, speed: 3, hp: 50, probability: 0.2, color: 'yellow' },
};

// Function to choose enemy type based on probability
function chooseEnemyType() {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const type in enemyTypes) {
        cumulativeProbability += enemyTypes[type].probability;
        if (random < cumulativeProbability) {
            return type;
        }
    }

    return "basic"; // Fallback to basic type
}

// Enemy class
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.hp = enemyTypes[type].hp;
        this.speed = enemyTypes[type].speed;
        this.color = enemyTypes[type].color;
        this.value = enemyTypes[type].value;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
        ctx.fillStyle = 'white';
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
    ctx.fillStyle = "white";
    ctx.fillText("Select a turret:", 10, 50);

    turretNames.forEach((type, index) => {
        const turret = turretTypes[type];
        ctx.fillStyle = turret.color;
        ctx.fillRect(10, 60 + index * 40, 20, 20);
        ctx.fillStyle = "white";
        ctx.fillText(`${type} (${turret.cost}$)`, 40, 75 + index * 40);
    });
}

// Spawn enemies at intervals
setInterval(() => {
    if (gameRunning) {
        const type = chooseEnemyType();
        const enemy = new Enemy(0, Math.random() * canvas.height, type);
        enemies.push(enemy);
        console.log(`Spawned: ${type}`); // Debug enemy spawning
    }
}, 2000);

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
            money += enemies[i].value;
            score += 10;
            enemies.splice(i, 1);
        } else if (enemies[i].x > canvas.width) {
            gameRunning = false;
            alert(`Game Over! Final Score: ${score}`);
        }
    }

    // Draw UI
    drawUI();

    // Display stats
    ctx.fillStyle = "white";
    ctx.fillText(`Score: ${score} | Money: ${money}`, 10, 20);

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
