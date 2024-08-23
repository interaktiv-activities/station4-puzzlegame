// Card Slot and Swipe Handling
const cardSlot = document.querySelector('.card-slot');
const swipeCard = document.getElementById('swipe-card');
let startX = 0;
let currentX = 0;
let isSwiping = false;
let cardSlotWidth = cardSlot.offsetWidth; 

// Event Listeners for Swipe Actions
swipeCard.addEventListener('mousedown', startSwipe);
swipeCard.addEventListener('touchstart', startSwipe);
swipeCard.addEventListener('mousemove', swipeMove);
window.addEventListener('touchmove', swipeMove);
window.addEventListener('mouseup', endSwipe);
swipeCard.addEventListener('touchend', endSwipe);
window.addEventListener('resize', updateCardSlotWidth);

// Swipe Functions
function updateCardSlotWidth() {
    cardSlotWidth = cardSlot.offsetWidth;
}

function startSwipe(event) {
    isSwiping = true;
    startX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
}

function swipeMove(event) {
    if (!isSwiping) 
        {
            return
        } else if (isSwiping) {
            currentX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
            const deltaX = currentX - startX;
        
            // Check if swipe reached the threshold
            if (Math.abs(deltaX) > (cardSlotWidth/1.8) && isSwiping == true) {
                isSwiping = false;
                swipeCard.style.transitionDuration = `.5s`
                swipeCard.style.transform = `translateX(${cardSlotWidth}px)`;
                swipeCard.style.opacity = `0`
                startCardInterval();
            }
            else if (deltaX > 1)
            {
                swipeCard.style.transitionDuration = `0s`;
                swipeCard.style.transform = `translateX(${deltaX}px)`;
            }
        }


}

function endSwipe() {
    if (isSwiping) {
        isSwiping = false;
        swipeCard.style.transform = 'translateX(0)';
    }
}

// Sound Functions
let backgroundMusic = new Audio();
backgroundMusic.src = "sounds/bg-music.mp3";
let backgroundMusicStatus = 0;
let backgroundMusicInterval;

document.getElementById("mute-header-btn").addEventListener("click", muteBackgroundMusic);

function playBackgroundMusic() {
    backgroundMusic.play();
    if (backgroundMusicStatus == 1) {
        backgroundMusic.volume = 0;
    } else {
        backgroundMusic.volume = 0.5;
    }
}

function muteBackgroundMusic() {
    const muteBtnImg = document.getElementById("mute-btn-img");
    if (backgroundMusicStatus == 0) {
        muteBtnImg.setAttribute("src", "assets/header/mute.png");
        backgroundMusic.volume = 0;
        backgroundMusicStatus++;
    } else {
        muteBtnImg.setAttribute("src", "assets/header/unmute.png");
        backgroundMusic.volume = 0.5;
        backgroundMusicStatus--;
    }
}

// Timer Functions
let timer = 180;
let timeRemaining = timer;

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startCountdown() {
    const countdownInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining < 0) {
            clearInterval(countdownInterval);
            endGame();
            return;
        }
        updateTimerDisplay();
    }, 1000);
}

// Start Screen to Game Board Transition
let startScreenTimer;

window.onload = function() {
    initializeBoard();
}

function startCardInterval() {
    startScreenTimer = setInterval(startGame, 500);
    startCountdown();
}

function hideStartScreen() {
    document.getElementById("start-screen").style.display = "none";
    playBackgroundMusic();
    backgroundMusicInterval = setInterval(playBackgroundMusic, 120000);
    clearInterval(startScreenTimer);
    initializeBoard();
}

// End Game Functions
function endGame() {
    document.getElementById("game-board").style.display = "none";
    document.getElementById("header").style.display = "none";
    clearInterval(backgroundMusicInterval);
    backgroundMusic.volume = 0;
    backgroundMusicStatus = 1
    if (img >= 3) {
        document.getElementById("pass-end-screen").style.display = "flex";
    } else {
        document.getElementById("fail-end-screen").style.display = "flex";
    }
}

// Game Initialization and Puzzle Setup
function startGame() {
    hideStartScreen();
}

let rows = 4;
let columns = 4;
let currTile;
let otherTile;
let scoreCounter = 0;
let img = 1;
let initialPositions = [];
let titlePrompt = document.getElementById("title");

function initializeBoard() {
    let pieces = [];
    for (let i = 1; i <= rows * columns; i++) {
        pieces.push(i.toString());
    }

    initialPositions = [...pieces];

    pieces.reverse();
    for (let i = 0; i < pieces.length; i++) {
        let j = Math.floor(Math.random() * pieces.length);
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }

    let board = document.getElementById("board");
    board.innerHTML = ""; 

    for (let i = 0; i < pieces.length; i++) {
        let tile = document.createElement("img");
        tile.src = `assets/images/${img}/${pieces[i]}.jpg`;
        tile.addEventListener("click", handleClick);
        board.append(tile);
    }

    titlePrompt.innerHTML = titleBank[img - 1];

    // Initialize score based on correct positions
    updateScore();
}

// Handle Tile Clicks and Swapping
let firstTile = null;

function handleClick(e) {
    let clickedTile = e.target;

    if (firstTile === null) {
        // First tile selected
        firstTile = clickedTile;
        firstTile.style.border = "2px solid red"; 
    } else {
        // Second tile selected
        let firstImg = firstTile.src;
        firstTile.src = clickedTile.src;
        clickedTile.src = firstImg;

        // Remove border from the first tile and reset the reference
        firstTile.style.border = ""; 
        let secondTile = clickedTile; 

        // Extract filenames and numbers
        let currImgName = secondTile.src.split('/').pop(); 
        let otherImgName = firstTile.src.split('/').pop(); 
        let currNumber = getNumberFromFilename(currImgName);
        let otherNumber = getNumberFromFilename(otherImgName);

        // Get indices of tiles in the DOM
        let tiles = document.getElementById("board").getElementsByTagName("img");
        let currIndex = Array.prototype.indexOf.call(tiles, secondTile);
        let otherIndex = Array.prototype.indexOf.call(tiles, firstTile);

        // Check the correctness before and after swapping
        let currCorrectBefore = getNumberFromFilename(initialPositions[currIndex]) === otherNumber;
        let otherCorrectBefore = getNumberFromFilename(initialPositions[otherIndex]) === currNumber;
        let currCorrectAfter = getNumberFromFilename(initialPositions[currIndex]) === currNumber;
        let otherCorrectAfter = getNumberFromFilename(initialPositions[otherIndex]) === otherNumber;

        // Update score based on the correctness of the tiles' positions
        if (!currCorrectBefore && currCorrectAfter) {
            scoreCounter++;
        } else if (currCorrectBefore && !currCorrectAfter) {
            scoreCounter--;
        }

        if (!otherCorrectBefore && otherCorrectAfter) {
            scoreCounter++;
        } else if (otherCorrectBefore && !otherCorrectAfter) {
            scoreCounter--;
        }

        firstTile = null; 

        // Check if the puzzle is completed
        checkCompletion();
    }
}

// Utility Functions
function getNumberFromFilename(filename) {
    let matches = filename.match(/\d+/);
    return matches ? parseInt(matches[0]) : null;
}

function checkCompletion() {
    let tiles = document.getElementById("board").getElementsByTagName("img");
    let completed = true;

    for (let i = 0; i < tiles.length; i++) {
        let imgName = tiles[i].src.split('/').pop(); 
        let number = getNumberFromFilename(imgName); 

        if (getNumberFromFilename(initialPositions[i]) !== number) {
            completed = false;
            break;
        }
    }

    if (completed) {
        if (img < 2) {
            img++;
            initializeBoard();
            timeRemaining = timer;
        } else {
            img++;
            endGame();
        }
    }
}

function updateScore() {
    let tiles = document.getElementById("board").getElementsByTagName("img");
    scoreCounter = 0; // Reset the score
    for (let i = 0; i < tiles.length; i++) {
        let imgName = tiles[i].src.split('/').pop(); // Get the image name
        let number = getNumberFromFilename(imgName); // Get the number from the image name

        if (getNumberFromFilename(initialPositions[i]) === number) {
            scoreCounter++;
        }
    }
}

function showCompletedImage() {
    let board = document.getElementById("board");
    board.innerHTML = ""; 

    let completedImage = document.createElement("img");
    completedImage.src = `assets/images/${img}/41.jpg`; 
    completedImage.style.width = "99%"; 
    completedImage.style.height = "auto"; 

    board.append(completedImage);
}

// Titles

let titleBank = [
    "Student Information System (SIS)",
    "Bigsky"
]
