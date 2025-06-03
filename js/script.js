const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const bala = document.querySelector('.bala');
let loop = null;
let balaLoop = null;
let isCrouching = false;
let isJumping = false; // NOVA VARIÁVEL
let score = 0;
let highscore = localStorage.getItem('mario_highscore') || 0;
const scoreSpan = document.getElementById('score');
const highscoreSpan = document.getElementById('highscore');

// Atualiza o recorde ao iniciar
if (highscoreSpan) highscoreSpan.textContent = highscore;

const jump = () => {
    if (isJumping) return; // Impede múltiplos pulos
    isJumping = true;
    mario.classList.add('jump');

    setTimeout(() => {
        mario.classList.remove('jump');
        isJumping = false;
    }, 500);
}

const crouch = () => {
    if (isJumping) return; // NÃO AGACHA NO AR
    mario.classList.add('crouch');
    isCrouching = true; // Atualiza o estado
};

const uncrouch = () => {
    mario.classList.remove('crouch');
    isCrouching = false; // Atualiza o estado
};

function startGame() {
    score = 0;
    if (scoreSpan) scoreSpan.textContent = score;

    // Reinicia o Mario e o cano caso o jogo já tenha sido jogado
    mario.src = './imagens/mario.gif';
    mario.style.width = '';
    mario.style.marginLeft = '';
    mario.style.bottom = '';
    mario.style.animation = '';
    pipe.style.animation = '';
    pipe.style.left = '';

    // Reinicia a bala
    if (bala) {
        bala.style.display = 'block';
        bala.style.animation = 'bala-animation 2s linear infinite';
    }

    // Remove event listeners antigos para evitar múltiplos binds
    document.onkeydown = null;
    document.onkeyup = null;

    document.addEventListener('keydown', (event) => {
        if ((event.key === 'w' || event.key === 'W') && !isCrouching) {
            jump();
        }
        if (event.key === 's' || event.key === 'S') {
            crouch();
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 's' || event.key === 'S') {
            uncrouch();
        }
    });

    loop = setInterval(() => {
        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

        if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
            pipe.style.animation = 'none';
            pipe.style.left = `${pipePosition}px`;

            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;

            mario.src = './imagens/game-over.png';
            mario.style.width = '75px';
            mario.style.marginLeft = '50px';

            clearInterval(loop);
            gameOver();
        }
    }, 10);

    // Loop da bala para detectar colisão com o Mario
    if (balaLoop) clearInterval(balaLoop);
    balaLoop = setInterval(() => {
        if (!bala) return;
        const balaRect = bala.getBoundingClientRect();
        const marioRect = mario.getBoundingClientRect();

        // Ajuste: reduz a hitbox horizontal da bala para ser mais justa
        const hitboxBala = {
            left: balaRect.left + balaRect.width * 0.2,
            right: balaRect.right - balaRect.width * 0.2,
            top: balaRect.top,
            bottom: balaRect.bottom
        };

        const colideHorizontal = hitboxBala.left < marioRect.right && hitboxBala.right > marioRect.left;
        const marioAgachado = isCrouching;
        const colideVertical = hitboxBala.bottom > marioRect.top + 20 && hitboxBala.top < marioRect.bottom - 40;

        if (colideHorizontal && colideVertical && !marioAgachado) {
            // Mario morreu pela bala
            bala.style.animation = 'none';
            bala.style.left = `${balaRect.left}px`;

            mario.src = './imagens/game-over.png';
            mario.style.width = '75px';
            mario.style.marginLeft = '50px';

            clearInterval(loop);
            clearInterval(balaLoop);
            gameOver();
        }
    }, 10);

    // Pontuação aumenta a cada 100ms enquanto vivo
    let scoreInterval = setInterval(() => {
        score++;
        if (scoreSpan) scoreSpan.textContent = score;
        // Atualiza recorde se bater
        if (score > highscore) {
            highscore = score;
            if (highscoreSpan) highscoreSpan.textContent = highscore;
            localStorage.setItem('mario_highscore', highscore);
        }
    }, 100);

    // Quando morrer, para o score
    function gameOver() {
        clearInterval(scoreInterval);
        document.getElementById('restart-btn').style.display = 'block';
    }
}

window.onload = () => {
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const gameBoard = document.querySelector('.game-board');
    if (startBtn && gameBoard) {
        startBtn.addEventListener('click', () => {
            startGame();
            gameBoard.style.display = 'block';
            startBtn.style.display = 'none';
            restartBtn.style.display = 'none';
        });
    }
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            restartBtn.style.display = 'none';
            startGame();
        });
    }
}