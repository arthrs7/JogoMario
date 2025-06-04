const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const bala = document.querySelector('.bala');
const browser = document.querySelector('.browser');
const boladefogo = document.querySelector('.boladefogo');
let loop = null;
let balaLoop = null;
let isCrouching = false;
let isJumping = false; // NOVA VARIÁVEL
let score = 0;
let highscore = localStorage.getItem('mario_highscore') || 0;
const scoreSpan = document.getElementById('score');
const highscoreSpan = document.getElementById('highscore');
let bossActive = false;
let bossPhase = false;
let bossTopLoop = null;
let bossBottomLoop = null;

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
    bossActive = false;
    bossPhase = false;
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

    // Reinicia o pipe
    pipe.style.display = 'block';

    // Esconde e reseta as bolas de fogo
    const bolaTop = document.querySelector('.boladefogo-top');
    const bolaBottom = document.querySelector('.boladefogo-bottom');
    if (bolaTop) {
        bolaTop.style.display = 'none';
        bolaTop.style.animation = 'none';
        bolaTop.style.left = '100%';
    }
    if (bolaBottom) {
        bolaBottom.style.display = 'none';
        bolaBottom.style.animation = 'none';
        bolaBottom.style.left = '100%';
    }

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
    scoreInterval = setInterval(() => {
        score++;
        if (scoreSpan) scoreSpan.textContent = score;
        if (score > highscore) {
            highscore = score;
            if (highscoreSpan) highscoreSpan.textContent = highscore;
            localStorage.setItem('mario_highscore', highscore);
        }
        // Ativa o boss ao chegar em 10 pontos (para teste)
        if (score === 10 && !bossActive) {
            bossActive = true;
            startBoss();
        }
    }, 100);
}

function gameOver() {
    clearInterval(loop);
    clearInterval(balaLoop);
    if (typeof scoreInterval !== 'undefined') clearInterval(scoreInterval);
    document.getElementById('restart-btn').style.display = 'block';
}

function startBoss() {
    // Some com pipe e bala
    pipe.style.display = 'none';
    bala.style.display = 'none';
    if (balaLoop) clearInterval(balaLoop);
    clearInterval(loop);

    // Mostra o browser entrando da direita, olhando para a esquerda
    browser.src = './imagens/browserandando.gif';
    browser.style.display = 'block';
    browser.style.left = '100%';
    browser.style.transform = 'scaleX(1)'; // olha para a esquerda

    // Anda até uma posição mais distante do Mario
    setTimeout(() => {
        browser.style.left = '1000px'; // mais distante do Mario
        // Quando chegar, para e troca para parado
        setTimeout(() => {
            browser.src = './imagens/browserparado.gif';
            // Espera 2 segundos, faz animação
            setTimeout(() => {
                browser.src = './imagens/browseranimacao.gif';
                // Depois volta a andar para a direita
                setTimeout(() => {
                    browser.src = './imagens/browserandando.gif';
                    browser.style.transform = 'scaleX(-1)'; // olha para a direita
                    browser.style.left = '100%';
                    // Quando quase sair da tela, ataca
                    setTimeout(() => {
                        browser.style.transform = 'scaleX(1)'; // olha para o Mario
                        browser.src = './imagens/browserataque.gif';
                        // Aparece as bolas de fogo
                        const bolaTop = document.querySelector('.boladefogo-top');
                        const bolaBottom = document.querySelector('.boladefogo-bottom');
                        // bolaTop.style.display = 'block';
                        // bolaTop.style.animation = 'bala-animation 0.25s infinite linear';
                        // bolaBottom.style.display = 'block';
                        // bolaBottom.style.animation = 'pipe-animaction 1.2s infinite linear';

                        // Apenas:
                        setTimeout(() => {
                            browser.style.left = '110%';
                            setTimeout(() => {
                                browser.style.display = 'none';
                                bossPhase = true;
                                startBossPhase();
                            }, 700);
                        }, 700);
                    }, 1200); // tempo para browser quase sair da tela
                }, 2000); // tempo da animação browseranimacao.gif
            }, 2000); // tempo parado
        }, 1000); // tempo andando até o centro
    }, 1000); // tempo inicial para entrar
}

function startBossPhase() {
    // Limpa loops antigos
    if (bossTopLoop) { clearInterval(bossTopLoop); bossTopLoop = null; }
    if (bossBottomLoop) { clearInterval(bossBottomLoop); bossBottomLoop = null; }

    // Pega as bolas de fogo
    const bolaTop = document.querySelector('.boladefogo-top');
    const bolaBottom = document.querySelector('.boladefogo-bottom');

    // Esconde e reseta as bolas de fogo
    bolaTop.style.display = 'none';
    bolaTop.style.animation = 'none';
    bolaTop.style.left = '100%';
    bolaBottom.style.display = 'none';
    bolaBottom.style.animation = 'none';
    bolaBottom.style.left = '100%';

    // Mostra as bolas de fogo
    bolaTop.style.display = 'block';
    bolaBottom.style.display = 'block';

    // Loop da bola de fogo de cima (para agachar)
    bossTopLoop = setInterval(() => {
        bolaTop.style.animation = 'none';
        bolaTop.offsetHeight; // força reflow
        bolaTop.style.left = '100%';
        bolaTop.style.animation = 'boladefogo-animation-top 0.7s linear';

        // Verifica colisão durante a animação
        let topCollisionInterval = setInterval(() => {
            const marioRect = mario.getBoundingClientRect();
            const bolaRectTop = bolaTop.getBoundingClientRect();
            const hitboxTop = {
                left: bolaRectTop.left + bolaRectTop.width * 0.2,
                right: bolaRectTop.right - bolaRectTop.width * 0.2,
                top: bolaRectTop.top,
                bottom: bolaRectTop.bottom
            };
            const colideHorizontalTop = hitboxTop.left < marioRect.right && hitboxTop.right > marioRect.left;
            const colideVerticalTop = hitboxTop.bottom > marioRect.top + 20 && hitboxTop.top < marioRect.bottom - 40;
            if (colideHorizontalTop && colideVerticalTop && !isCrouching) {
                bolaTop.style.animation = 'none';
                bolaTop.style.left = `${bolaRectTop.left}px`;
                mario.src = './imagens/game-over.png';
                mario.style.width = '75px';
                mario.style.marginLeft = '50px';
                clearInterval(loop);
                clearInterval(bossTopLoop);
                clearInterval(bossBottomLoop);
                clearInterval(topCollisionInterval);
                gameOver();
            }
        }, 10);

        setTimeout(() => {
            clearInterval(topCollisionInterval);
        }, 700); // tempo igual ao da animação
    }, 1500); // intervalo entre bolas de fogo de cima (ajuste para não ficar muito rápido)

    // Loop da bola de fogo de baixo (para pular)
    bossBottomLoop = setInterval(() => {
        bolaBottom.style.animation = 'none';
        bolaBottom.offsetHeight; // força reflow
        bolaBottom.style.left = '100%';
        bolaBottom.style.animation = 'boladefogo-animation-bottom 0.7s linear';

        // Verifica colisão durante a animação
        let bottomCollisionInterval = setInterval(() => {
            const marioRect = mario.getBoundingClientRect();
            const bolaRectBottom = bolaBottom.getBoundingClientRect();
            const hitboxBottom = {
                left: bolaRectBottom.left + bolaRectBottom.width * 0.2,
                right: bolaRectBottom.right - bolaRectBottom.width * 0.2,
                top: bolaRectBottom.top,
                bottom: bolaRectBottom.bottom
            };
            const colideHorizontalBottom = hitboxBottom.left < marioRect.right && hitboxBottom.right > marioRect.left;
            const colideVerticalBottom = hitboxBottom.bottom > marioRect.top + 20 && hitboxBottom.top < marioRect.bottom - 40;
            if (colideHorizontalBottom && colideVerticalBottom && !isJumping) {
                bolaBottom.style.animation = 'none';
                bolaBottom.style.left = `${bolaRectBottom.left}px`;
                mario.src = './imagens/game-over.png';
                mario.style.width = '75px';
                mario.style.marginLeft = '50px';
                clearInterval(loop);
                clearInterval(bossTopLoop);
                clearInterval(bossBottomLoop);
                clearInterval(bottomCollisionInterval);
                gameOver();
            }
        }, 10);

        setTimeout(() => {
            clearInterval(bottomCollisionInterval);
        }, 700); // tempo igual ao da animação
    }, 1500); // intervalo entre bolas de fogo de baixo (mais lento que a de cima)
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