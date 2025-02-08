class Bird {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 3;
        this.y = canvas.height / 2;
        this.radius = 15;
        this.velocity = 0;
        this.gravity = 0.1;
        this.jumpForce = -1;
        this.rotation = 0;
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);

        // 绘制小鸟身体
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fill();

        // 绘制小鸟眼睛
        this.ctx.beginPath();
        this.ctx.arc(5, -5, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();

        // 绘制小鸟嘴巴
        this.ctx.beginPath();
        this.ctx.moveTo(10, 0);
        this.ctx.lineTo(20, 0);
        this.ctx.lineTo(15, 5);
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fill();

        this.ctx.restore();
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        this.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.velocity * 0.1));
    }

    jump() {
        this.velocity = this.jumpForce;
    }

    checkCollision(pipes) {
        for (let pipe of pipes) {
            if (this.x + this.radius > pipe.x && this.x - this.radius < pipe.x + pipe.width) {
                if (this.y - this.radius < pipe.topHeight || this.y + this.radius > pipe.topHeight + pipe.gap) {
                    return true;
                }
            }
        }
        return this.y + this.radius > this.canvas.height || this.y - this.radius < 0;
    }
}

class Pipe {
    constructor(canvas, x) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.width = 50;
        this.gap = 150;
        this.speed = 2;
        this.topHeight = Math.random() * (canvas.height - this.gap - 100) + 50;
    }

    draw() {
        // 上管道
        this.ctx.fillStyle = '#43A047';
        this.ctx.fillRect(this.x, 0, this.width, this.topHeight);

        // 管道顶部装饰
        this.ctx.fillStyle = '#2E7D32';
        this.ctx.fillRect(this.x - 5, this.topHeight - 20, this.width + 10, 20);

        // 下管道
        this.ctx.fillStyle = '#43A047';
        this.ctx.fillRect(this.x, this.topHeight + this.gap, this.width, this.canvas.height);

        // 管道底部装饰
        this.ctx.fillStyle = '#2E7D32';
        this.ctx.fillRect(this.x - 5, this.topHeight + this.gap, this.width + 10, 20);
    }

    update() {
        this.x -= this.speed;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.bird = new Bird(this.canvas);
        this.pipes = [];
        this.score = 0;
        this.isGameOver = false;
        this.isStarted = false;

        this.startScreen = document.getElementById('startScreen');
        this.startButton = document.getElementById('startButton');
        this.scoreElement = document.getElementById('scoreValue');

        this.setupEventListeners();
        this.draw();
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isStarted && !this.isGameOver) {
                this.bird.jump();
            }
        });
        this.canvas.addEventListener('click', () => {
            if (this.isStarted && !this.isGameOver) {
                this.bird.jump();
            }
        });
    }

    startGame() {
        this.isStarted = true;
        this.isGameOver = false;
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.bird = new Bird(this.canvas);
        this.pipes = [];
        this.startScreen.style.display = 'none';
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isGameOver) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        } else {
            this.startScreen.style.display = 'block';
        }
    }

    update() {
        this.bird.update();

        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 200) {
            this.pipes.push(new Pipe(this.canvas, this.canvas.width));
        }

        this.pipes.forEach((pipe, index) => {
            pipe.update();
            if (pipe.x + pipe.width < this.bird.x && !pipe.passed) {
                pipe.passed = true;
                this.score++;
                this.scoreElement.textContent = this.score;
            }
        });

        this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > 0);

        if (this.bird.checkCollision(this.pipes)) {
            this.isGameOver = true;
        }
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制云朵
        this.drawClouds();

        // 绘制管道
        this.pipes.forEach(pipe => pipe.draw());

        // 绘制小鸟
        this.bird.draw();
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const drawCloud = (x, y, size) => {
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.arc(x + size, y, size * 0.8, 0, Math.PI * 2);
            this.ctx.arc(x + size * 0.5, y - size * 0.5, size * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
        };

        drawCloud(50, 80, 20);
        drawCloud(200, 60, 25);
        drawCloud(280, 100, 15);
    }
}

// 初始化游戏
window.onload = () => {
    new Game();
};