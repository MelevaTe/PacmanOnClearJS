let pac_man = {x:2, y:20};
let ghost1 = {x: 10, y: 10};
let ghost2 = {x: 2, y: 2};
let ghost3 = {x: 18, y: 2};
let ghost4 = {x: 18, y: 19};
let totalFood = 215;
let ghost1Direction = 1;
let ghost2Direction = 2;
let ghost3Direction = 3;
let ghost4Direction = 4;
let speed = 15;
let scorePerFood = 1
let startGame = false;
let activeDirection = 6;
let previousActiveDirection;
let pressed = false;
let score = 0;
let requestAnimateId;

function displayHighScores() {
    const records = JSON.parse(localStorage.getItem('highScores')) || [];
    const list = document.getElementById('highScoresList'); // Список для рекордов

    list.innerHTML = '';

    records.forEach((record, index) => {
        const li = document.createElement('li'); // Создаём новый элемент списка

        li.textContent = ` ${record} очков `;

        list.appendChild(li);
    });
}

displayHighScores();

function saveNewRecord(score) {
    let records = JSON.parse(localStorage.getItem('highScores')) || [];
    records.push(score);
    records.sort((a, b) => b - a);
    localStorage.setItem('highScores', JSON.stringify(records));
}

// Получаем родительский элемент, который содержит все кнопки
const buttonWrapper = document.querySelector('.button_wrapper');

// Добавляем обработчик события на родительский элемент
buttonWrapper.addEventListener('click', (event) => {
    switch (event.target.textContent) {
        case 'Easy':
            console.log('Выбрана легкая сложность');
            speed= 15;
            scorePerFood = 1;
            break;
        case 'Medium':
            console.log('Выбрана средняя сложность');
            speed= 22;
            scorePerFood = 1.5;
            break;
        case 'Hard':
            console.log('Выбрана сложная сложность');
            speed= 35;
            scorePerFood = 2;
            break;
        default:
            console.log('Неизвестная сложность');
    }
});



let wallMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];




let completeWallMaps = [];

for (let i = 0; i < wallMap.length; i++) {
    for (let j = 0; j < wallMap[i].length; j++) {
        if (wallMap[i][j]===1) {
            completeWallMaps.push({w:true, f: false, x:i+1, y: j+1});
        }
        else {
            completeWallMaps.push({w:false, f: true, x:i+1, y: j+1});
        }
    }
}

completeWallMaps.forEach((e,index) => {
    if (e.w) {
        wallElement = document.createElement("div");
        wallElement.style.gridColumnStart= e.x;
        wallElement.style.gridRowStart= e.y;
        wallElement.classList.add("wall");
        map.append(wallElement);
    }
    else if (e.f) {
        foodElement = document.createElement("div");
        foodElement.style.gridColumnStart= e.x;
        foodElement.style.gridRowStart= e.y;
        foodElement.classList.add("food");
        map.append(foodElement);
    }

});

pacElement = document.createElement("div");
pacElement.style.gridColumnStart= pac_man.x;
pacElement.style.gridRowStart= pac_man.y;
pacElement.classList.add("pac");
map.append(pacElement);

ghostElement = document.createElement("div");
ghostElement.style.gridColumnStart= ghost1.x;
ghostElement.style.gridRowStart= ghost1.y;
ghostElement.classList.add("ghost1");
map.append(ghostElement);

ghostElement = document.createElement("div");
ghostElement.style.gridColumnStart= ghost2.x;
ghostElement.style.gridRowStart= ghost2.y;
ghostElement.classList.add("ghost2");
map.append(ghostElement);

ghostElement = document.createElement("div");
ghostElement.style.gridColumnStart= ghost3.x;
ghostElement.style.gridRowStart= ghost3.y;
ghostElement.classList.add("ghost3");
map.append(ghostElement);

ghostElement = document.createElement("div");
ghostElement.style.gridColumnStart= ghost4.x;
ghostElement.style.gridRowStart= ghost4.y;
ghostElement.classList.add("ghost4");
map.append(ghostElement);


window.addEventListener("keydown", (e) => {
    switch(e.key) {
        case "Enter":
            startGame = true;
            break
        case "ArrowRight":
            checkIfPacEaten();
            pressed =true;
            previousActiveDirection = activeDirection;
            activeDirection = 6;
            break;
        case "ArrowLeft":
            checkIfPacEaten();
            pressed =true;
            previousActiveDirection = activeDirection;
            activeDirection = 4;
            break;
        case "ArrowUp":
            checkIfPacEaten();
            pressed =true;
            previousActiveDirection = activeDirection;
            activeDirection = 8;
            break;
        case "ArrowDown":
            checkIfPacEaten();
            pressed =true;
            previousActiveDirection = activeDirection;
            activeDirection = 2;
            break;
        default:
            break;
    }
});

function checkIfPacEaten() {
    if (
        (pac_man.x === ghost1.x && pac_man.y === ghost1.y) ||
        (pac_man.x === ghost2.x && pac_man.y === ghost2.y) ||
        (pac_man.x === ghost3.x && pac_man.y === ghost3.y) ||
        (pac_man.x === ghost4.x && pac_man.y === ghost4.y)
    ) {
        return true;
    }
    else {
        return false;
    }
}

function animate() {
    setTimeout(() => {
        requestAnimateId = requestAnimationFrame(animate);
        gameEngine();
    }, 3000/speed);
}

window.requestAnimationFrame(animate);

function gameEngine() {
    if (checkIfPacEaten()) {
        alert("Game over")
        saveNewRecord(score);
        location.reload()
    }
    else {
        if (startGame) {
            if (totalFood!==0) {
                moveGhost1Random();
                moveGhost2Random();
                moveGhost3Random();
                moveGhost4Random();
                movePac(activeDirection);
            }
            else {
                alert("Pac man won")
                saveNewRecord(score);
            }
        }
    }
}

function movePac(moveDirection) {
    console.log({moveDirection});
    let isWall = false;
    let rotate = '';

    // Функция проверки на стену
    const checkWall = (x, y) => {
        isWall = false; // сбрасываем статус стены
        completeWallMaps.forEach((elem) => {
            if (elem.w && elem.x === x && elem.y === y) {
                isWall = true;
            }
        });
    };

    // Проверяем направление и обновляем координаты пакмена
    if (moveDirection === 8) {
        checkWall(pac_man.x, pac_man.y - 1);
        if (!isWall) {
            pac_man = { x: pac_man.x, y: pac_man.y - 1 };
            rotate = "rotate(180deg)";
        }
    }

    if (moveDirection === 2) {
        checkWall(pac_man.x, pac_man.y + 1);
        if (!isWall) {
            pac_man = { x: pac_man.x, y: pac_man.y + 1 };
            rotate = "rotate(360deg)";
        }
    }

    if (moveDirection === 4) {
        checkWall(pac_man.x - 1, pac_man.y);
        if (!isWall) {
            pac_man = { x: pac_man.x - 1, y: pac_man.y };
            rotate = "rotate(90deg)";
        }
    }

    if (moveDirection === 6) {
        checkWall(pac_man.x + 1, pac_man.y);
        if (!isWall) {
            pac_man = { x: pac_man.x + 1, y: pac_man.y };
            rotate = "rotate(-90deg)";
        }
    }

    // Если стен нет, обновляем позицию пакмена на экране
    if (!isWall) {
        const allPacContainer = document.querySelectorAll(".pac");

        allPacContainer.forEach((element) => {
            element.remove();
        });

        pacElement = document.createElement("div");
        pacElement.style.gridColumnStart = pac_man.x;
        pacElement.style.gridRowStart = pac_man.y;
        pacElement.style.transform = rotate;
        pacElement.classList.add("pac");


        map.appendChild(pacElement);
        pressed = false;

        // Проверка на съеденную еду
        completeWallMaps.forEach((e) => {
            if (e.f && e.x === pac_man.x && e.y === pac_man.y) {
                foodElement = document.createElement("div");
                foodElement.style.gridColumnStart = e.x;
                foodElement.style.gridRowStart = e.y;
                foodElement.classList.add("nofood");
                map.append(foodElement);
                e.f = false;
                score += 10*scorePerFood;
                totalFood -= 1;
                console.log({ totalFood });
            }
        });

        document.getElementById("score").innerHTML = score;
    } else if (pressed) {
        activeDirection = previousActiveDirection;
        pressed = false;
        movePac(activeDirection);
    }
}

function moveGhost1Random() {
    if (!checkIfPacEaten()) {
        let isWall = false;

        // Проверяем, столкнется ли призрак со стеной в текущем направлении
        completeWallMaps.forEach((elem) => {
            if (
                (ghost1Direction === 1 && elem.x === ghost1.x && elem.y === ghost1.y - 1 && elem.w) ||
                (ghost1Direction === 2 && elem.x === ghost1.x + 1 && elem.y === ghost1.y && elem.w) ||
                (ghost1Direction === 3 && elem.x === ghost1.x && elem.y === ghost1.y + 1 && elem.w) ||
                (ghost1Direction === 4 && elem.x === ghost1.x - 1 && elem.y === ghost1.y && elem.w)
            ) {
                isWall = true;
            }
        });

        // Если призрак не столкнулся со стеной, перемещаем его
        if (!isWall) {
            if (ghost1Direction === 1) {
                ghost1 = { x: ghost1.x, y: ghost1.y - 1 };
            } else if (ghost1Direction === 2) {
                ghost1 = { x: ghost1.x + 1, y: ghost1.y };
            } else if (ghost1Direction === 3) {
                ghost1 = { x: ghost1.x, y: ghost1.y + 1 };
            } else if (ghost1Direction === 4) {
                ghost1 = { x: ghost1.x - 1, y: ghost1.y };
            }
        } else {
            // Если столкнулся со стеной, выбираем новое случайное направление
            ghost1Direction = Math.floor(Math.random() * 4) + 1;
        }

        // Обновляем элемент призрака на карте
        const allGhostContainer = document.querySelectorAll(".ghost1");
        allGhostContainer.forEach((element) => element.remove());

        ghostElement = document.createElement("div");
        ghostElement.style.gridColumnStart = ghost1.x;
        ghostElement.style.gridRowStart = ghost1.y;
        ghostElement.classList.add("ghost1");
        map.append(ghostElement);
    }
}

function moveGhost2Random() {
    if (!checkIfPacEaten()) {
        let isWall = false;

        completeWallMaps.forEach((elem) => {
            if (
                (ghost2Direction === 1 && elem.x === ghost2.x && elem.y === ghost2.y - 1 && elem.w) ||
                (ghost2Direction === 2 && elem.x === ghost2.x + 1 && elem.y === ghost2.y && elem.w) ||
                (ghost2Direction === 3 && elem.x === ghost2.x && elem.y === ghost2.y + 1 && elem.w) ||
                (ghost2Direction === 4 && elem.x === ghost2.x - 1 && elem.y === ghost2.y && elem.w)
            ) {
                isWall = true;
            }
        });

        if (!isWall) {
            if (ghost2Direction === 1) {
                ghost2 = { x: ghost2.x, y: ghost2.y - 1 };
            } else if (ghost2Direction === 2) {
                ghost2 = { x: ghost2.x + 1, y: ghost2.y };
            } else if (ghost2Direction === 3) {
                ghost2 = { x: ghost2.x, y: ghost2.y + 1 };
            } else if (ghost2Direction === 4) {
                ghost2 = { x: ghost2.x - 1, y: ghost2.y };
            }
        } else {
            ghost2Direction = Math.floor(Math.random() * 4) + 1;
        }

        const allGhostContainer = document.querySelectorAll(".ghost2");
        allGhostContainer.forEach((element) => element.remove());

        ghostElement = document.createElement("div");
        ghostElement.style.gridColumnStart = ghost2.x;
        ghostElement.style.gridRowStart = ghost2.y;
        ghostElement.classList.add("ghost2");
        map.append(ghostElement);
    }
}

function moveGhost3Random() {
    if (!checkIfPacEaten()) {
        let isWall = false;

        completeWallMaps.forEach((elem) => {
            if (
                (ghost3Direction === 1 && elem.x === ghost3.x && elem.y === ghost3.y - 1 && elem.w) ||
                (ghost3Direction === 2 && elem.x === ghost3.x + 1 && elem.y === ghost3.y && elem.w) ||
                (ghost3Direction === 3 && elem.x === ghost3.x && elem.y === ghost3.y + 1 && elem.w) ||
                (ghost3Direction === 4 && elem.x === ghost3.x - 1 && elem.y === ghost3.y && elem.w)
            ) {
                isWall = true;
            }
        });

        if (!isWall) {
            if (ghost3Direction === 1) {
                ghost3 = { x: ghost3.x, y: ghost3.y - 1 };
            } else if (ghost3Direction === 2) {
                ghost3 = { x: ghost3.x + 1, y: ghost3.y };
            } else if (ghost3Direction === 3) {
                ghost3 = { x: ghost3.x, y: ghost3.y + 1 };
            } else if (ghost3Direction === 4) {
                ghost3 = { x: ghost3.x - 1, y: ghost3.y };
            }
        } else {
            ghost3Direction = Math.floor(Math.random() * 4) + 1;
        }

        const allGhostContainer = document.querySelectorAll(".ghost3");
        allGhostContainer.forEach((element) => element.remove());

        ghostElement = document.createElement("div");
        ghostElement.style.gridColumnStart = ghost3.x;
        ghostElement.style.gridRowStart = ghost3.y;
        ghostElement.classList.add("ghost3");
        map.append(ghostElement);
    }
}

function moveGhost4Random() {
    if (!checkIfPacEaten()) {
        let isWall = false;

        completeWallMaps.forEach((elem) => {
            if (
                (ghost4Direction === 1 && elem.x === ghost4.x && elem.y === ghost4.y - 1 && elem.w) ||
                (ghost4Direction === 2 && elem.x === ghost4.x + 1 && elem.y === ghost4.y && elem.w) ||
                (ghost4Direction === 3 && elem.x === ghost4.x && elem.y === ghost4.y + 1 && elem.w) ||
                (ghost4Direction === 4 && elem.x === ghost4.x - 1 && elem.y === ghost4.y && elem.w)
            ) {
                isWall = true;
            }
        });

        if (!isWall) {
            if (ghost4Direction === 1) {
                ghost4 = { x: ghost4.x, y: ghost4.y - 1 };
            } else if (ghost4Direction === 2) {
                ghost4 = { x: ghost4.x + 1, y: ghost4.y };
            } else if (ghost4Direction === 3) {
                ghost4 = { x: ghost4.x, y: ghost4.y + 1 };
            } else if (ghost4Direction === 4) {
                ghost4 = { x: ghost4.x - 1, y: ghost4.y };
            }
        } else {
            ghost4Direction = Math.floor(Math.random() * 4) + 1;
        }

        const allGhostContainer = document.querySelectorAll(".ghost4");
        allGhostContainer.forEach((element) => element.remove());

        ghostElement = document.createElement("div");
        ghostElement.style.gridColumnStart = ghost4.x;
        ghostElement.style.gridRowStart = ghost4.y;
        ghostElement.classList.add("ghost4");
        map.append(ghostElement);
    }
}

