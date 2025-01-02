const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Game state
const turrets = [];
const enemies = [];
let money = 100;
let score = 0;
let gameRunning = true;

// Turret class
class Turret {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.range = 100;
        this.cooldown = 0;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
    }

    shoot(enemy) {
        if (this.cooldown <= 0 && this.inRange(enemy)) {
            this.cooldown = 50;
            enemy.hp -= 10;
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
        ctx.fillStyle = this.hp > 0 ? 'red' : 'gray';
        ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
    }

    update() {
        this.x += this.speed;
    }
}

// Event listener for placing turrets
canvas.addEventListener('click', (e) => {
    if (money >= 50) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        turrets.push(new Turret(x, y));
        money -= 50;
    }
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
            turret.shoot(enemy);
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

    // Display stats
    ctx.fillStyle = "white";
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
