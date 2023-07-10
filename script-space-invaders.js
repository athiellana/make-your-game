const GAME_WIDTH = 1450;
const GAME_HEIGTH = 800;
const PLAYER_WIDTH = 55;

const MAX_PLAYER_SPEED = 850;
let MAX_LASERS_SPEED = 600;
const MAX_ENEMY_LASER_SPEED = 450;
const MAX_ENEMY_SPEED = 150;
const ENEMY_SPEED_APPROCH = 25;  

let LASER_FORM = "../assets/PNG/Lasers/laserBlue06.png"; //default laser
let ENEMY_LASER_FORM = "assets/PNG/Lasers/laserRed07.png"; //default enemies lasers
let LASER_COOLDOWN = 2;
let ENEMY_COOLDOWN = 10;
const ENEMY_PER_ROW = 9;  // default 10
const ENEMY_PER_COLUMN = 4; // default 4
const TOTAL_ENEMIES = ENEMY_PER_ROW * ENEMY_PER_COLUMN;
const ENEMY_VERTICAL_PADDING = 80;
const ENEMY_HORIZONTAL_PADDING = 150;
const ENEMY_VERTICAL_SPACING = 80;
const STD_ENEMY_POINTS = 10;

const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGTH = 39;
const KEY_CODE_SPACE = 32; 
const KEY_CODE_PAUSE = 80; // p
const KEY_CODE_RESTART = 82; // r
const KEY_CODE_CONTINUE = 13; // enter
const KEY_CODE_MENU = 77; // m => menu entrer

const KEY_CODE_GOD_MOD = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let GOD_MOD = false;

const TIME_LIMIT = 100;


let GAME_THEME = new Audio("img/Bonus/game-theme.ogg");

let GAME_STATE = {
    lastTime: Date.now(),
    leftPressed: false, 
    rigthPressed: false,
    spacePressed: false,
    playerX: 0,
    playerY: 0,
    playerLife: 3,
    playerPoint: 0,
    playerCooldown: 0,

    lasers: [],
    enemies: [],
    enemiesLasers: [], 

    pauseOn: false,
    gameOver: false,
    gameWin: false,
};

// FPS system

const fps = document.getElementById("fps");
var startTime = Date.now();
var frame = 0;

function refreeshLoop() {
    var time = Date.now();
    frame++;
    if (time - startTime > 1000) {
        fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
        startTime = time;
        frame = 0;
	}
    window.requestAnimationFrame(refreeshLoop);
}


// Timer system

let timerInterval = null;
let timePassed = 0;
let timeLeft = TIME_LIMIT;

function startTimer() {
    timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById("timer").innerHTML = formatTime(timeLeft);

    if (timeLeft === 0) {
        GAME_STATE.gameOver = true;
        onTimesUp();
    }
    }, 1000);
}

// Point system

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}

function onTimesUp() {
    clearInterval(timerInterval);
    timerInterval = undefined;
}

function starTimer() {
    if (!timerInterval) startTimer();
}


function pauseTimer() {
    onTimesUp();
}


function resumeTimer() {
    if (!timerInterval) startTimer();
}


function resetTimer() {
    if (timerInterval) {
        onTimesUp();
    }
    timePassed = 0;
    timerInterval = null;

    document.getElementById("timer").innerHTML = formatTime(timeLeft);
}

//position and limit of map
function setPosition($element, x, y) {  
    if (!GAME_STATE.pauseOn) {
        $element.style.transform = `translate(${x}px, ${y}px)`; 
    }
};

function EdgeCollision(rec1, rec2) {
    return (
        rec2.top > rec1.bottom
    );
}

function collision(r1, r2) {
    return  !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    ); 
}
    
function clamp(value, min, max) {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
};

function rand(min, max) {
    if (min == undefined) min = 0;
    if (max == undefined) max = 1;
    return min + Math.random() * (max - min);
    
}
    
//Display player score

function displayPlayerScore() {
    const playerScore = document.getElementById("score");
    playerScore.innerHTML = GAME_STATE.playerPoint;
};

    // create element of the game
function createPlayer($container) {
    GAME_STATE.playerX = GAME_WIDTH / 2; // place player
    GAME_HEIGTH.playerY = GAME_HEIGTH - 50;
    
    const $player = document.createElement("img"); // $ => DOM variable element  // player
    $player.src = "assets/PNG/playerShip00.png";
    $player.className ="player";
    $container.appendChild($player);
    setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

function createEnemy($container, x, y) {
    const $enemies = document.createElement("img");
    $enemies.src = "assets/PNG/alien_010 .png";
    $enemies.className = "enemy";
    $container.appendChild($enemies);
    const enemy = { 
        x,
        y,
        cooldown: rand(0.5, ENEMY_COOLDOWN),
        $enemies,
    };
    GAME_STATE.enemies.push(enemy);
    setPosition($enemies, x, y);
}

function createLaser($container, x, y) {
    const $element = document.createElement("img");
    $element.src = LASER_FORM;
    $element.className = "laser";
    $container.appendChild($element);
    const laser = { x, y, $element};
    GAME_STATE.lasers.push(laser);
    setPosition($element, x, y);
    let shootSound = new Audio("img/Bonus/sfx_laser2.ogg");
    shootSound.volume = 0.7;
    shootSound.play();
};

function createEnemiesLasers($container, x, y) {
    const $element = document.createElement("img");
    $element.src = ENEMY_LASER_FORM;
    $element.className = "enemy-laser";
    $container.appendChild($element);
    const laser = {$element, x, y};
    GAME_STATE.enemiesLasers.push(laser);
    setPosition($element, x, y);
};

function createLife($container) {
    let lifeSpacing = 40;
    for (let i = 0; i < GAME_STATE.playerLife; i++) {
        const $life = document.createElement('img');
        $life.src = "assets/PNG/playerShip00.png";
        $life.className = "life";
        $life.setAttribute("id", `life: ${i+1}`); 
        $container.appendChild($life);
        $life.style.transform = `translate(${1450 + i * lifeSpacing}px, 800px )`;
    }
}


//set the game zone 
function init() {
    const $container = document.querySelector(".game"); // container => zone de jeu
    createPlayer($container);
    createLife($container);
    
    //set enemies positions
    const enemy_spacing = (1000 - ENEMY_HORIZONTAL_PADDING * 2) / (ENEMY_PER_ROW -1);
    for (let i = 0; i < ENEMY_PER_COLUMN; i++) {
        const y = ENEMY_VERTICAL_PADDING + i * ENEMY_VERTICAL_SPACING;
        for (let j = 0; j < ENEMY_PER_ROW; j++) {
            const x = j * enemy_spacing + ENEMY_HORIZONTAL_PADDING;
            createEnemy($container, x, y);
        }
    }
};

//player and enemies options moove, shoot...
function updatePlayer(deltaTime, $container) {

    if (GAME_STATE.leftPressed) {
        GAME_STATE.playerX -= deltaTime * MAX_PLAYER_SPEED; // set vitesse pixel par seconde (set 850px / sec)
    } 
    if (GAME_STATE.rigthPressed) {
        GAME_STATE.playerX += deltaTime * MAX_PLAYER_SPEED;
    }  
    if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) {
        if (!GAME_STATE.pauseOn) {
            createLaser($container, GAME_STATE.playerX, GAME_STATE.playerY);
            GAME_STATE.playerCooldown = LASER_COOLDOWN;
        }
    } 
    if (GAME_STATE.playerCooldown > 0) {
        GAME_STATE.playerCooldown -= deltaTime;     
    }
    
    GAME_STATE.playerX = clamp(GAME_STATE.playerX, PLAYER_WIDTH, GAME_WIDTH-PLAYER_WIDTH); // limite la zone de jeu au dimension du cadre etabli
    
    const $player = document.querySelector(".player");
    setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
    //collision player enemies
    const rec1 = $player.getBoundingClientRect();
    const enemies = GAME_STATE.enemies;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const rec2 = enemy.$enemies.getBoundingClientRect();
        if (enemy.isDead) continue;
        if (collision(rec1, rec2)) {
            destroyEnemies($container, enemy);
            destroyPlayer($container, $player);
            let deathSound = new Audio("img/Bonus/big-impact-7054.ogg");
            deathSound.volume = 0.5;
            deathSound.play();
            GAME_STATE.gameOver = true;
            break;
        }
    }
};

function updateEnemies(deltaTime, $container) {
    let EnemiesMoovement = 300;
    let EnemiesApporched = setInterval((x) => { x++}, 10000);;
    
    
    const dx = Math.sin(GAME_STATE.lastTime / 2200) * EnemiesMoovement;
    const dy = EnemiesApporched / ENEMY_SPEED_APPROCH;
    const enemies = GAME_STATE.enemies;    
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const x = enemy.x + dx;
        const y = enemy.y + dy;
        setPosition(enemy.$enemies, x, y);
        if (enemy.isDead) continue;
        const rec1 = $container.getBoundingClientRect();
        const rec2 = enemy.$enemies.getBoundingClientRect();
        if (EdgeCollision(rec1, rec2)) {
            GAME_STATE.gameOver = true;
            break;
        }

        enemy.cooldown -= deltaTime;
        if (enemy.cooldown <= 0) {
            if (!GAME_STATE.pauseOn) {
                if (!GOD_MOD) {
                    createEnemiesLasers($container, x, y);
                    enemy.cooldown = ENEMY_COOLDOWN;
                }
            }
        }
    }
    GAME_STATE.enemies = GAME_STATE.enemies.filter(el => !el.isDead);
}

function updateLasers(deltaTime, $container) {
    const lasers = GAME_STATE.lasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y -= deltaTime * MAX_LASERS_SPEED;
        if (laser.y < -800) { 
            destroyLaser($container, laser);
            GAME_STATE.playerCooldown = 0;

        }
        setPosition(laser.$element, laser.x, laser.y);
        const r1 = laser.$element.getBoundingClientRect();
        const enemies = GAME_STATE.enemies;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];  
            if (enemy.isDead) continue;
            const r2 = enemy.$enemies.getBoundingClientRect();
            if (collision(r1, r2)) {
                // Enemy was hit
                GAME_STATE.playerPoint += STD_ENEMY_POINTS;
                displayPlayerScore(GAME_STATE.playerPoint);
                destroyEnemies($container, enemy);
                destroyLaser($container, laser);
                GAME_STATE.playerCooldown = 0;
                break;
            }
        }
    }
    GAME_STATE.lasers = GAME_STATE.lasers.filter(el => !el.isDead);
}

function updateEnemiesLaser(deltaTime, $container) {
    const lasers = GAME_STATE.enemiesLasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y += deltaTime * MAX_ENEMY_LASER_SPEED;
        if (laser.y > GAME_HEIGTH) {
            destroyLaser($container, laser);
        }
        setPosition(laser.$element, laser.x, laser.y);
        const rec1 = laser.$element.getBoundingClientRect();
        const player = document.querySelector(".player");
        if (player == null) {
            GAME_STATE.gameOver = true;
            break;
        }

        const rec2 = player.getBoundingClientRect();
        if (collision(rec1, rec2)) {
            //console.log(GAME_STATE.playerLife);
            GAME_STATE.playerLife--;
            let life = document.querySelector(".life"); 
            life.remove();
            const enemies = GAME_STATE.enemies;
            enemies.cooldown = ENEMY_COOLDOWN;
            let hitSound = new Audio("img/Bonus/sfx_twoTone.ogg");
            hitSound.volume = 0.8;
            hitSound.play();
            destroyLaser($container, laser);
            if (GAME_STATE.playerLife == 0) { 
                destroyPlayer($container, player);
                GAME_STATE.gameOver = true;
                let deathSound = new Audio("img/Bonus/big-impact-7054.ogg");
                deathSound.play();
                break;
            }
        } 
    }
    GAME_STATE.enemiesLasers = GAME_STATE.enemiesLasers.filter(el => !el.isDead);   
}


function destroyLaser($container, laser) {  
    $container.removeChild(laser.$element);
    laser.isDead = true;
}

function destroyEnemies($container, enemy) {
    $container.removeChild(enemy.$enemies);
    enemy.isDead = true;
}

function destroyPlayer($container, player) {
    $container.removeChild(player);
    GAME_STATE.gameOver = true;
}

function Win() {
    return GAME_STATE.enemies.length == 0;
}


function update() { 

    const currentTime = Date.now();
    const deltaTime = (currentTime - GAME_STATE.lastTime) / 1000; // recup le temps de deplacement entre chaque frame
    const $container = document.querySelector(".game");
    
    GAME_THEME.volume = 0.7;
    GAME_THEME.play();

    if (GAME_STATE.pauseOn) {
        GAME_THEME.pause();
    }

    
    
    updatePlayer(deltaTime, $container);
    updateLasers(deltaTime, $container);
    updateEnemies(deltaTime, $container);
    updateEnemiesLaser(deltaTime, $container);
    displayPlayerScore($container);


    if (GAME_STATE.gameOver) {
        pauseTimer();
        GAME_THEME.pause();
        let gameLooseTheme = new Audio("img/Bonus/loose-theme.ogg");
        gameLooseTheme.volume = 0.4;
        gameLooseTheme.play();
        document.querySelector(".game-over").style.display = "block";
        return;
    }
    
    if (Win()) {
        if (!GOD_MOD) { 
            window.location.replace("http://127.0.0.1:5501/boss-no-cheat/index-nocheat.html"); 
        } else {
            window.location.replace("http://127.0.0.1:5501/boss-cheatON/index-cheatON.html");
        }
        pauseTimer();
        GAME_THEME.pause();
        let gameWinTheme = new Audio("img/Bonus/win-theme.ogg");
        gameWinTheme.play();
        const lasers = GAME_STATE.lasers;
        for (let i = 0; i < GAME_STATE.lasers.length; i++) {
            const laser = lasers[i];
            destroyLaser($container, laser);
        }
        document.querySelector(".game").classList.remove("cheat");
        document.querySelector(".congratulations").style.display = "block";
        GAME_STATE.gameWin = true;
        return;
    }
    GAME_STATE.lastTime = currentTime;

    if (!GAME_STATE.pauseOn) {
        window.requestAnimationFrame(update);
    } 
};

function pauseGame() {
    GAME_STATE.pauseOn = true;
    document.querySelector(".game-paused").style.display = "block";
};

function resumeGame() {
    GAME_STATE.lastTime = Date.now();
    GAME_STATE.pauseOn = false; 
    window.requestAnimationFrame(update);
    document.querySelector(".game-paused").style.display = "none"; 
};

// Uh Oh nOT tHiS vbjnk,ldvbn,;
function easyMod() {
    MAX_LASERS_SPEED = 1352;
    LASER_COOLDOWN = 0;
    LASER_FORM = "assets/PNG/Lasers/laserBlue08.png";
    ENEMY_LASER_FORM = "assets/PNG/Lasers/laserGreen02.png";
    GOD_MOD = true;
}

var current = 0;
function ActivateCheat(event) { 
    if (GAME_STATE.gameOver || GAME_STATE.gameWin) { 
        return;
    } else if (GOD_MOD) {
        return;
    }
	if (KEY_CODE_GOD_MOD.indexOf(event.key) < 0 || event.key !== KEY_CODE_GOD_MOD[current]) {
		current = 0;
		return;
	}
    current++;
	// If complete, alert and reset
	if (KEY_CODE_GOD_MOD.length === current) {
		current = 0;
		window.alert("You Will Regret it !");
        const gameSet = document.querySelector(".game");
        gameSet.classList.add("cheat");
        document.title = "Enemy Attack Detected !";
        easyMod();
        // si tu meurs pendant le godmod tu respawn direct avec message spécial 
	}
};

//define event system
function onKeyDown(event) {
    if (event.keyCode == KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = true;
    } else if (event.keyCode == KEY_CODE_RIGTH) {
        GAME_STATE.rigthPressed = true;
    } else if (event.keyCode == KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = true;
    } 
    if (GAME_STATE.pauseOn && event.keyCode == KEY_CODE_RESTART) {
        window.location.reload();
    }
    if (GAME_STATE.gameOver && event.keyCode == KEY_CODE_RESTART) {
        window.location.reload();
    } else if (GAME_STATE.gameWin && event.keyCode == KEY_CODE_RESTART) {
        window.location.reload();
    } else if ( GAME_STATE.gameWin && event.keyCode == KEY_CODE_MENU) {
        window.location.href = "start-menu/templates/index.html";
    }
};

function onKeyUp(event) { // au lieu de creer x millier d'event quand on maintient permet de creer un event qui dure autant de temps que keypressed
    if (event.keyCode == KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = false;
    } else if (event.keyCode == KEY_CODE_RIGTH) {
        GAME_STATE.rigthPressed = false;
    }  else if (event.keyCode == KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = false;
    } 
};

function setPause(event) {
    if (!GAME_STATE.gameOver && !GAME_STATE.gameWin) { 

        if (event.keyCode == KEY_CODE_PAUSE) {
            if (GAME_STATE.pauseOn) {
                resumeGame();
                resumeTimer();
            } else {
                pauseGame();
                pauseTimer();
            }
        }
    }
};

startTimer();
refreeshLoop();
init();
window.addEventListener("keydown", setPause);
window.addEventListener("keydown", ActivateCheat);
window.addEventListener("keydown", onKeyDown);  
window.addEventListener("keyup", onKeyUp);
window.requestAnimationFrame(update);


//A FAIRE OBLIGATOIRE =>

//BONUS =>

//scoreboard
//système d'effet bonus 
// système de niveau 
// 2 players


