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

class Turret {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.range = 100; // Shooting range
        this.cooldown = 0; // Time until next shot
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
        // Draw range (optional for visualization)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
        ctx.stroke();
    }

    shoot(enemy) {
        if (this.cooldown <= 0 && this.inRange(enemy)) {
            this.cooldown = 50; // Reset cooldown (e.g., 50 frames)
            enemy.hp -= 10; // Damage enemy
        }
    }

    inRange(enemy) {
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.range; // Pythagoras
    }

    update() {
        if (this.cooldown > 0) {
            this.cooldown--; // Reduce cooldown over time
        }
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hp = 100;
        this.speed = 1; // Moves horizontally
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
        // Draw HP
        ctx.fillStyle = 'white';
        ctx.fillText(this.hp, this.x - 10, this.y - 15);
    }

    update() {
        this.x += this.speed; // Move enemy forward
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
                turret.shoot(enemy); // Attack enemies
            }
        }
    }

    // Remove defeated enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= 0) {
            enemies.splice(i, 1); // Remove dead enemy
            score += 10; // Increase score
            money += 20; // Reward money
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
