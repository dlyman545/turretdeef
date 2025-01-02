// Set font for canvas text
ctx.font = "16px Arial";

// Normalize probabilities
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
            money += enemies[i].value; // Reward money
            score += 10; // Increase score
            enemies.splice(i, 1); // Remove defeated enemy
        } else if (enemies[i].x > canvas.width) {
            gameRunning = false;
            alert("Game Over! Final Score: " + score);
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
