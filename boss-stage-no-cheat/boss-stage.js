const GAME_WIDTH = 1450;
const GAME_HEIGTH = 800;
const PLAYER_WIDTH = 55;

const MAX_PLAYER_SPEED = 550;
let MAX_LASERS_SPEED = 600;
const MAX_ENEMY_LASER_SPEED = 550;
const MAX_ENEMY_SPEED = 150;
const ENEMY_SPEED_APPROCH = 25;  

let LASER_FORM = "../assets/PNG/Lasers/laserBlue06.png"; //default laser
let BOSS_LASER = "../assets/PNG/Lasers/laserRed10.png";
let BOSS_COOLDOWN = 1;
let LASER_COOLDOWN = 2; //SALOME LE LASER DU JOUEUR EST ICI OUBLIE PAS DE LE REMETTRE A 2

const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGTH = 39;
const KEY_CODE_SPACE = 32; 
const KEY_CODE_PAUSE = 80; // p
const KEY_CODE_RESTART = 82; // r
const KEY_CODE_CONTINUE = 13; // enter
const KEY_CODE_MENU = 77; // m => menu entrer
let GOD_MOD = false;
const TIME_LIMIT = 210;


let GAME_THEME = new Audio("../img/Bonus/legit-boss.ogg");

let GAME_STATE = {
    lastTime: Date.now(),
    leftPressed: false, 
    rigthPressed: false,
    spacePressed: false,
    playerX: 0,
    playerY: 0,
    playerLife: 1,
    playerPoint: 400,
    playerCooldown: 0,

    boss: [],
    bossX: 0,
    bossY: 0,
    bossLife: 30,
    bossCooldown: 1,


    lasers: [],
    bossLaser: [],

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
    if (!GAME_STATE.pauseOn || !GAME_STATE.gameWin || !GAME_STATE.gameOver) {
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
    $player.src = "../assets/PNG/playerShip00.png";
    $player.className ="player";
    $container.appendChild($player);
    setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

function createLaser($container, x, y) {
    const $element = document.createElement("img");
    $element.src = LASER_FORM;
    $element.className = "laser";
    $container.appendChild($element);
    const laser = {x, y, $element};
    GAME_STATE.lasers.push(laser);
    setPosition($element, x, y);
    let shootSound = new Audio("../img/Bonus/sfx_laser2.ogg");
    shootSound.volume = 0.7;
    shootSound.play();
};

function createBoss($container) {
    GAME_STATE.bossX = 600;
    GAME_STATE.bossY = 100;
    const $boss = document.createElement("img");
    $boss.src = "https://media.giphy.com/media/xIDQazr1Uo52npRG7n/giphy.gif";
    $boss.className = "boss";
    $container.appendChild($boss);
    setPosition($boss, GAME_STATE.bossX, GAME_STATE.bossY);
}

function createLife($container) {
    let lifeSpacing = 40;
    for (let i = 0; i < GAME_STATE.playerLife; i++) {
        const $life = document.createElement('img');
        $life.src = "../assets/PNG/playerShip00.png";
        $life.className = "life";
        $life.setAttribute("id", `life: ${i+1}`); 
        $container.appendChild($life);
        $life.style.transform = `translate(${1450 + i * lifeSpacing}px, 800px )`;
    }
}

function createBossLaser($container, x, y) {
    const $element = document.createElement("img");
    $element.src = BOSS_LASER;
    $element.className = "bossLaser";
    $container.appendChild($element);
    const bossLaser = {x, y, $element};
    GAME_STATE.bossLaser.push(bossLaser);
    setPosition($element, x, y);
}

function updateBossLaser(deltaTime, $container) {
    const lasers = GAME_STATE.bossLaser;
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
            GAME_STATE.playerLife--;
            let life = document.querySelector(".life"); 
            life.remove();
            const boss = GAME_STATE.boss;
            boss.cooldown = BOSS_COOLDOWN;
            let hitSound = new Audio("../img/Bonus/sfx_twoTone.ogg");
            hitSound.volume = 0.8;
            hitSound.play();
            destroyLaser($container, laser);
            if (GAME_STATE.playerLife == 0) { 
                destroyPlayer($container, player);
                GAME_STATE.gameOver = true;
                let deathSound = new Audio("../img/Bonus/big-impact-7054.ogg");
                deathSound.play();
                break;
            }
        } 
    }
        GAME_STATE.bossLaser = GAME_STATE.bossLaser.filter(el => !el.isDead);

}

//set the game zone 
function init() {
    const $container = document.querySelector(".game"); // container => zone de jeu
    createPlayer($container);
    createBoss($container);
    createLife($container);
    
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
};

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
        const boss = document.querySelector(".boss");
        const rec1 = laser.$element.getBoundingClientRect();
        const rec2 = boss.getBoundingClientRect();
        if (laser.isDead) continue;
        if (collision(rec1, rec2)) {
            GAME_STATE.bossLife--;
            let lifeBarBoss = document.getElementById("boss-life");
            lifeBarBoss.value -= 1;
            destroyLaser($container, laser);
            GAME_STATE.playerCooldown = 0;
            if (GAME_STATE.bossLife == 0) {
                destroyBoss($container, boss);
                break;
            }
        }
        
    }
    GAME_STATE.lasers = GAME_STATE.lasers.filter(el => !el.isDead);
}

function updateBoss(deltaTime, $container) {
    const bossMoovement = 350;
    const dx = Math.sin(GAME_STATE.lastTime / 2300) * bossMoovement;
    const $boss = document.querySelector(".boss");
    setPosition($boss, GAME_STATE.bossX + dx, GAME_STATE.bossY);
    const x = GAME_STATE.bossX + dx - 220;
    GAME_STATE.bossCooldown -= deltaTime;
    if (GAME_STATE.bossCooldown <= 0) {
        if (!GAME_STATE.pauseOn && !GAME_STATE.gameWin && !GAME_STATE.gameOver) {
            if (!GOD_MOD) {
                createBossLaser($container, x, GAME_STATE.bossY + 250);
                createBossLaser($container, x + 100, GAME_STATE.bossY + 250);
                createBossLaser($container, x - 100, GAME_STATE.bossY + 250);
                createBossLaser($container, x - 200, GAME_STATE.bossY + 250);
                createBossLaser($container, x + 200, GAME_STATE.bossY + 250);
                GAME_STATE.bossCooldown = 3;
            }
        }
    }
}

function destroyBoss($container, boss) {
    $container.removeChild(boss);
    GAME_STATE.gameWin = true;
}

function destroyLaser($container, laser) {  
    $container.removeChild(laser.$element);
    laser.isDead = true;
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
    const player = document.querySelector(".player");
    const boss = document.querySelector(".boss");
    let lifeBarBoss = document.getElementById("boss-life");
    const lasers = GAME_STATE.lasers;
    
    GAME_THEME.volume = 0.7;
    GAME_THEME.play();

    if (GAME_STATE.pauseOn) {
        GAME_THEME.pause();
    }

    
    
    updatePlayer(deltaTime, $container);
    updateBoss(deltaTime, $container);
    updateLasers(deltaTime, $container);
    updateBossLaser(deltaTime, $container);
    displayPlayerScore($container);


    if (GAME_STATE.gameOver) {
        for (let j = 0; j < GAME_STATE.bossLaser.length; j++ ) {
            const bossLaser = GAME_STATE.bossLaser[j];
            destroyLaser($container, bossLaser);
        }
        for (let i = 0; i < GAME_STATE.lasers.length; i++) {
            const laser = lasers[i];
            destroyLaser($container, laser);

        }
        window.location.href = window.location.href.replace("boss-stage.html", "../end-lost/end-lost-captain.html")
        //document.querySelector(".game-over").style.display = "block";
        lifeBarBoss.style.display = "none";
        destroyBoss($container, boss);
        destroyPlayer($container, player);
        pauseTimer();
        GAME_THEME.pause();
        let gameLooseTheme = new Audio("../img/Bonus/loose-theme.ogg");
        gameLooseTheme.volume = 0.4;
        gameLooseTheme.play();
        return;
    }

    if (GAME_STATE.gameWin) {
        for (let i = 0; i < GAME_STATE.lasers.length; i++) {
            const laser = lasers[i];
            destroyLaser($container, laser);
        }
        window.location.href = window.location.href.replace("boss-stage.html", "../end-win/end-win.html");
        destroyPlayer($container, player);
        pauseTimer();
        GAME_THEME.pause();
        let gameWinTheme = new Audio("../img/Bonus/win-theme.ogg");
        gameWinTheme.volume = 0.5;
        gameWinTheme.play();
        //document.querySelector(".congratulations").style.display = "block";
        lifeBarBoss.style.display = "none";
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
window.addEventListener("keydown", onKeyDown);  
window.addEventListener("keyup", onKeyUp);
window.requestAnimationFrame(update);


//A FAIRE OBLIGATOIRE =>

    // bar de vie du boss
    // past 50% => increase difficulty of pattern (change le style vitre brisé)
    // past 10% => encore plus vénère et casque cassé complet
//BONUS =>

//scoreboard
//système d'effet bonus 
// système de niveau 
// 2 players