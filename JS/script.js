// ***Preload settings

let ONE_STEP_LENGTH = 1;
let HEIGHT_OF_JUMP = 100;

let logCollection = new Map();

let obstacleCollection = new Map();

let keySettings = new Object(); // Настройки управления

keySettings.moveLeft = 'ArrowLeft';
keySettings.moveRight = 'ArrowRight';
keySettings.jump = 'Space';
keySettings.moveUp = 'ArrowUp';
keySettings.moveDown = 'ArrowDown';

document.body.style = `
    margin: 0;
    width: 100%;
    height: 100vh;
    position: relative;
`

function objPositionSettings(){
    gravity(spider);
    gravity(obstacle);
}

// ***End of Preload settings



// ***Creating of inGame elements

let floor = document.createElement('div');

floor.style.position = 'absolute';
floor.style.width = 100 + '%';
floor.style.bottom = 5 + '%';
floor.style.height = 2 + 'px';
floor.style.backgroundColor = 'black';

document.body.append(floor);

obstacleCollection.set(floor); //!!!

let obstacle = createGameElement({
    backgroundColor : 'green',
    position : 'absolute',
    width : 100 + 'px',
    height : 100 + 'px',
    top : 540 + 'px',
    left : 300 + 'px'
}, 'div');

document.body.append(obstacle);

obstacleCollection.set(obstacle);

// let obstacle2 = createGameElement({
//     backgroundColor : 'white',
//     position : 'absolute',
//     width : 100 + 'px',
//     height : 100 + 'px',
//     top : 640 + 'px',
//     left : 500 + 'px'
// }, 'div');

// document.body.append(obstacle2);

// obstacleCollection.set(obstacle2);

// let obstacle3 = createGameElement({
//     backgroundColor : 'black',
//     position : 'absolute',
//     width : 100 + 'px',
//     height : 100 + 'px',
//     top : 540 + 'px',
//     left : 400 + 'px'
// }, 'div');

// document.body.append(obstacle3);

// obstacleCollection.set(obstacle3);

createObstacles(3);

let spider = document.createElement('div');

spider.style.backgroundColor = 'blue';
spider.style.position = 'absolute';
spider.style.width = 100 + 'px';
spider.style.height = 100 + 'px';
spider.style.top = spider.style.left = 0;
// spider.style.transition =  'top 0.7s cubic-bezier(0.37, 0.12, 0.78, 1.05) 0s';
spider.style.backgroundImage = `url(Textures/spider-texture.jpg)`;
spider.style.backgroundSize = `contain`;

document.body.append(spider);

spider.jumpsBeforeLandedCount = 0;
spider.isGluedToObj = new Set();

// *** End of Creating of inGame elements



// ***Preparation functions

function createGameElement(objOfSettings, strTypeOfElement){
    let element = document.createElement(strTypeOfElement);

    for(let key in objOfSettings){
        element.style[key] = objOfSettings[key];
    }

    if(!element.hasOwnProperty(applySetting)){
        element.applySetting = applySetting;
    }

    return element;
}

function applySetting(objOfSettings){
    for(let key in objOfSettings){
        this.style[key] = objOfSettings[key];
    }

    return this;
}

function createObstacles(numberOfObstacles){
    for(let i = 0; i < numberOfObstacles; i++){
        let obstacle = createGameElement({
            backgroundColor : 'black',
            position : 'absolute',
            width : 100 + 'px',
            height : 100 + 'px',
            top : 540 + 'px',
            left : 400 + 'px'
        }, 'div');
        
        document.body.append(obstacle);
        
        obstacleCollection.set(obstacle);
    }
}

// ***End of Preparation functions



// *** InGame events & functions

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);
window.addEventListener('resize', objPositionSettings);

function onKeyDown(e){ //обработать одновременное нажатие нескольких клавиш одновременно
    if(e.code == keySettings.moveLeft) moveLeft(e, spider);
    if(e.code == keySettings.moveRight) moveRight(e, spider);
    if(e.code == keySettings.jump) jump(spider);
    // if(e.code == 'KeyS') gravity(spider);
    if(e.code == keySettings.moveUp) moveUp(e, spider);
    if(e.code == keySettings.moveDown) moveDown(e, spider);
}

function onKeyUp(e){
    if(logCollection.has(e.code)) {
        let timerId = logCollection.get(e.code);
        clearInterval(timerId);
        logCollection.delete(e.code);
    }
    if(logCollection.has('glued')){
        let element = logCollection.get('glued'); // а если glued содержит не один element?
        if(element.isGluedToObj.has(e.code)) element.isGluedToObj.delete(e.code);
        if(!element.isGluedToObj.size) gravity(element);
    }
}

function moveRight(e, element){

    // console.log(window.innerWidth);

    // if(compareZ_index(obstacle)) return;

    if(logCollection.has(e.code)) return;

    let timerId = setInterval(() => {
        let str = element.style.left;
        let newStr = str.slice(0, str.indexOf('p'));

        let oldValue = Number(newStr);
        let currentLeft = oldValue + ONE_STEP_LENGTH;
        if(currentLeft + element.clientWidth > window.innerWidth) currentLeft = oldValue; // ограничиваем выход за пределы экрана
        element.style.left = currentLeft + 'px';
        let obstacleData = obstacleOnTheWay(element, 'x'); // false если на пути не препятствия в этом направлении
        if (obstacleData){
            element.style.left = oldValue + 'px';
            if(element.isGluedToObj !== undefined) {
                element.isGluedToObj.add(e.code); // isGluedToObj - переименовать и научить хранить несколько значений 
                logCollection.set('glued', element);
                clearInterval(element.timerId);
                element.timerId = false;
            }
        }else{
            if(element.isGluedToObj !== undefined) {
                element.isGluedToObj.delete(e.code); // isGluedToObj - переименовать и научить хранить несколько значений 
                // logCollection.set('glued', element);
            }
        }

        if(!isLanded(element) && !element.isGluedToObj.size) gravity(element); // Если земля ушла из-под ног применить гравитацию

    }, 2);

    logCollection.set(e.code, timerId);
}

function moveLeft(e, element){

    if(logCollection.has(e.code)) return;

    let timerId = setInterval(() => {
        let str = element.style.left;
        let newStr = str.slice(0, str.indexOf('p'));

        let oldValue = Number(newStr);
        let currentLeft = oldValue - ONE_STEP_LENGTH;
        if(currentLeft < -1) currentLeft = -1; // ограничиваем выход за пределы экрана
        element.style.left = currentLeft + 'px';
        let obstacleData = obstacleOnTheWay(element, 'x'); // false если на пути не препятствия в этом направлении
        if (obstacleData){
            element.style.left = oldValue + 'px';
            if(element.isGluedToObj !== undefined) {
                element.isGluedToObj.add(e.code); // isGluedToObj - переименовать и научить хранить несколько значений 
                logCollection.set('glued', element);
                clearInterval(element.timerId);
                element.timerId = false;
            }
        }else{
            if(element.isGluedToObj !== undefined) {
                element.isGluedToObj.delete(e.code); // isGluedToObj - переименовать и научить хранить несколько значений 
                // logCollection.set('glued', element);
            }
        }
        
        if(!isLanded(element) && !element.isGluedToObj.size) gravity(element); // Если земля ушла из-под ног применить гравитацию
        
    }, 2);

    logCollection.set(e.code, timerId);
}

function moveUp(e, element){

    // console.log(element.isGluedToObj.size);

    //if(!element.isGluedToObj.size) return; !!!

    // if(compareZ_index(obstacle)) return;

    if(logCollection.has(e.code)) return;

    let timerId = setInterval(() => {
        // if(!element.isGluedToObj.size){
        //     console.log('up');
        //     // clearInterval(timerId);
        //     return;
        // } 
        let str = element.style.top;
        let newStr = str.slice(0, str.indexOf('p'));

        let oldValue = Number(newStr);
        let currentTop = oldValue - ONE_STEP_LENGTH;
        element.style.top = currentTop + 'px';
        let obstacleData = obstacleOnTheWay(element, 'y'); // false если на пути не препятствия в этом направлении
        if (obstacleData){
            element.style.top = oldValue + 'px';
            if(element.isGluedToObj !== undefined) {
                element.isGluedToObj.add(e.code); // isGluedToObj - переименовать и научить хранить несколько значений 
                logCollection.set('glued', element);
                clearInterval(element.timerId);
                element.timerId = false;
            }
        }else{
            
                // console.log(element.isGluedToObj);
            element.isGluedToObj.delete(e.code); // isGluedToObj - переименовать и научить хранить несколько значений 
                // logCollection.set('glued', element);
            
            if(!element.isGluedToObj.size) element.style.top = oldValue + 'px';
            
        }

        // if(!element.isGluedToObj.size) console.log('больше ползти нельзя');
        if(!isLanded(element) && !element.isGluedToObj.size) gravity(element); // Если земля ушла из-под ног применить гравитацию

    }, 2);

    logCollection.set(e.code, timerId);
}

function moveDown(e, element){

    // console.log(element.isGluedToObj.size);

    if(!element.isGluedToObj.size) return;

    // if(compareZ_index(obstacle)) return;

    if(logCollection.has(e.code)) return;

    let timerId = setInterval(() => {
        if(!element.isGluedToObj.size){
            // clearInterval(timerId);
            return;
        } 
        let str = element.style.top;
        let newStr = str.slice(0, str.indexOf('p'));

        let oldValue = Number(newStr);
        let currentTop = oldValue + ONE_STEP_LENGTH;
        element.style.top = currentTop + 'px';
        let obstacleData = obstacleOnTheWay(element, 'y'); // false если на пути не препятствия в этом направлении
        if (obstacleData){
            element.style.top = oldValue + 'px';
            if(element.isGluedToObj !== undefined) {
                element.isGluedToObj.add(e.code); // isGluedToObj - переименовать и научить хранить несколько значений 
                logCollection.set('glued', element);
                clearInterval(element.timerId);
                element.timerId = false;
            }
        }else{
            if(element.isGluedToObj !== undefined) {
                element.isGluedToObj.delete(e.code); // isGluedToObj - переименовать и научить хранить несколько значений 
                // logCollection.set('glued', element);
            }
        }

        // if(!element.isGluedToObj.size) console.log('больше ползти нельзя');
        if(!isLanded(element) && !element.isGluedToObj.size) gravity(element); // Если земля ушла из-под ног применить гравитацию

    }, 2);

    logCollection.set(e.code, timerId);
}

function gravity(element){

    // !!!!!!!!!
    // Проработать сценарий, в котором я запрыгнул на объект и с него сразу прыгнул на ещё один объект:
    // нужно перезапустить таймер срабатывания гравитации. Сейчас второй прыжок(если он сделан быстрее чем за 0.7сек)
    // заканчивается раньше положенного, так как приземление обрабатывает функция приземления, которая была вызвана первым 
    // прыжком

    if(element.timerId) return;
    // if(element.hasOwnProperty('isGluedToObj') && element.isGluedToObj.size) return;
    
    element.timerId = setTimeout(gravityAnimation, 700, element); // element.timerId заменить на element.status, где
                                                                  // status - это статус применения анимации гравитации.
                                                                  // gravityAnimation() переделать. Нужно, чтоб эта функция
                                                                  // плавно приземляла объект на препятствие или на землю

    function gravityAnimation(element){
        let isLanded = false;
        let floorTopCoord = floor.offsetTop;

        while(!isLanded){
            let oldTopCoordValue = element.offsetTop;
            let newTopCoordValue = oldTopCoordValue + element.clientHeight;
            element.style.top = newTopCoordValue + 'px';

            if(floorTopCoord + element.clientHeight < element.offsetTop + element.clientHeight) break; // предотвращаем проваливание под землю

            let obstacleData = obstacleOnTheWay(element, 'y');
            if(obstacleData){
                let newTopCoordValue = obstacleData[0].offsetTop;
                element.style.top = newTopCoordValue - element.clientHeight + 'px';
                isLanded = true;
                element.isFlying = false;
            }
        }

        // предотвращаем проваливание под землю
        if(floorTopCoord <= element.offsetTop + element.clientHeight){
            element.style.top = floorTopCoord - element.clientHeight + 'px';
            element.isFlying = false;
        }

        clearInterval(element.timerId);
        element.timerId = false;

        element.jumpsBeforeLandedCount = 0;
    }
}

function jump(element){
    // if already jumping - отменяем остаточную анимацию гравитации и запускаем новый прыжок с нуля. Заодно получаем двойной прыжок
    // В случае с setTimeout обнуляем таймер и запускаем прыжок с самого начала

    // Также нужно добавить счетчик многократности прыжка, чтобы избежать тройного и более прыжков

    if(element.jumpsBeforeLandedCount >= 2) return;

    element.jumpsBeforeLandedCount++;

    if(element.timerId){ // Если инициирован двойной прыжок, отменяем остаточную анимацию гравитации первого
        clearInterval(element.timerId);
        element.timerId = false;
    }

    // console.log(`jumping`);
    let top = parseInt(element.style.top);
    // let prevTop = element.style.top;
    element.style.top = top - HEIGHT_OF_JUMP + 'px';
    element.isFlying = true;
    let obstacleData = obstacleOnTheWay(element, 'y'); // false если на пути не препятствия в этом направлении
    if(!obstacleData){
        // setTimeout(gravity, 700, element);
        gravity(element);
    }else{
        let maxPosibleHeightOfJump = top - parseInt(simplyfyObj(obstacleData[0]).y) - 
                                           parseInt(simplyfyObj(obstacleData[0]).height);
        element.style.top = top - maxPosibleHeightOfJump + 'px';
        // setTimeout(gravity, 700, element);
        gravity(element);
    }
    
}

function obstacleOnTheWay(element, direction){

    let obj = simplyfyObj(element);
    let closestObstcle;

    if(!obstacleCollection.size) return false;

    for(let obstacle of obstacleCollection){
        if(element === obstacle[0]) continue;
        let obst = simplyfyObj(obstacle[0]);
        if(obst.x + obst.width > obj.x && 
           obst.x < obj.x + obj.width &&

           obst.y + obst.height > obj.y && 
           obst.y < obj.y + obj.height) {
               closestObstcle = whichOneIsCloser(closestObstcle, obstacle, obj, direction);
           }
    }
    return closestObstcle ? closestObstcle : false;
}

// *** End of InGame events & functions



// *** Animations

function animate({timing, draw, duration}) {

    let start = performance.now();
  
    requestAnimationFrame(function animate(time) {
      // timeFraction изменяется от 0 до 1
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;
  
      // вычисление текущего состояния анимации
      let progress = timing(timeFraction);
  
      draw(progress); // отрисовать её
  
      if (timeFraction < 1) {
        requestAnimationFrame(animate);
      }
  
    });
}

// *** End of animations



// *** Other functions

function simplyfyObj(obj){
    if(!obj) return obj;
    let newObj = new Object();

    // newObj.x = parseInt(getComputedStyle(obj).left);
    // newObj.y = parseInt(obj.style.top);
    newObj.x = obj.offsetLeft;
    newObj.y = obj.offsetTop;
    newObj.width = parseInt(obj.clientWidth);
    newObj.height = parseInt(obj.clientHeight);

    return newObj;

    // for(key in newObj) console.log(`${key}: ${newObj[key]}`)
}

function whichOneIsCloser(elem1, elem2, obj, direction){

    if(elem1 && !elem2) return elem1;
    if(!elem1 && elem2) return elem2;

    let firstElem = elem1[0];
    let secondElem = elem2[0];
 
    let obst1 = simplyfyObj(firstElem);
    let obst2 = simplyfyObj(secondElem);
    if(Math.abs(obj[direction] - obst1[direction]) < Math.abs(obj[direction] - obst2[direction])) return elem1;
    
    return elem2;
}

function isLanded(elem){
    if(!elem) return;
    let isLanded;

    let currentTop = parseInt(elem.style.top);
    elem.style.top = currentTop + 1 + 'px'; // смещаем на 1 пиксель вниз и проверяем на столкновение
    let obstacleData = obstacleOnTheWay(elem, 'y'); // false если на пути не препятствия в этом направлении

    if(obstacleData || currentTop + elem.clientHeight + 1 > floor.offsetTop) isLanded = true;

    elem.style.top = currentTop + 'px';

    if(isLanded) return true;
    return false;
}

// *** End of Other functions



// ***Functions calls
objPositionSettings();
// createObstacleMap_Xcoords(obstacle);