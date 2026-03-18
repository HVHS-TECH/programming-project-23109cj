console.log("script.js")

let throttle = 0.5;
let pitch = 0;
let cnv;
let missileTimer = 0;
let missile;
let score = 0;
let enemyTimer = 500;
let enemyGroup;
let particleGroup;
let particleTimer=0;

const GRAVITY = 5;
const LIFTCOEFFICENT = 0.3025;
const FRAMERATE = 60;
const PITCHSENSITIVITY = 0.12;
let groundHeight;      //as var so it can be read from all functions - value never changed after setup() so I have named it as a constant


//plane img source = https://upload.wikimedia.org/wikipedia/commons/9/93/A-7_Corsair_II.svg   -- Is creative commons - found by filtering google for creative commons only
//enemy img source = https://upload.wikimedia.org/wikipedia/commons/5/5a/F14_2_Wiki.jpg   -- Is creative commons - found by filtering google for creative commons only
//missile img source = https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHKue8u9AK_9maZw1459bZeo7c7QBAammykw&s   -- Is creative commons - found by filtering google for creative commons only
//cloud img source = https://upload.wikimedia.org/wikipedia/commons/7/7e/Cloud_PNG_Image.png

function preload() {
    console.log('preload()')
    imgPlane = loadImage('Images/A-7.svg');
    imgCloud = loadImage('Images/Cloud.png');
    imgMissile = loadImage('Images/missile.png');
    imgEnemy = loadImage('Images/F-14.png');

}

function setup() {
    console.log('setup()')
    frameRate(FRAMERATE)
    angleMode(DEGREES);
    groundHeight = windowHeight - windowHeight / 6;

    cnv = new Canvas(windowWidth, windowHeight);


    cloud = new Sprite(windowWidth, random(0, groundHeight), 10, 10, 'n')
    cloud.image = (imgCloud);
    cloud.image.scale = 0.5;

    plane = new Sprite(windowWidth / 6, groundHeight, 20, 20, 'd');
    plane.image = (imgPlane);
    plane.image.scale.y = 0.1;
    plane.image.scale.x = -0.1;
    plane.bouncieness = 0;

    ground = new Sprite(windowWidth / 2, groundHeight / 3 * 4.35, windowWidth, groundHeight, 'k');
    ground.color = '#00ff00';
    ground.bouncieness = 0;

    wallTop = new Sprite(windowWidth / 2, windowHeight / 2 - windowHeight, windowWidth, 5, 'k')
    wallTop.visible = false;

    enemyGroup = new Group()
    particleGroup = new Group()
}



function createEnemy(_playerX, _playerY) {
    let inSky = false
    enemy = new Sprite(_playerX - windowWidth / 2, random(_playerY - 100, _playerY + 100), 80, 30, 'k')
    while(inSky == false){
        if(enemy.overlaps(ground)){
            enemy.y += 100;
        }else{
            inSky = true;
        }
    }
    enemy.image = (imgEnemy);
    enemy.image.scale.y = 0.3;
    enemy.image.scale.x = -0.3;
    console.log('create enemy')

    enemyGroup.add(enemy)
}


//--------------------------------------------------------
//Launch Missle
//creates a new sprite, calc its velocity to be faster than plane by 25%, assigns img
//--------------------------------------------------------
function launchMissile() {
    missile = new Sprite(plane.x - 20, plane.y - 10, 40, 10, 'k');
    missile.vel.x = calculateHorizontalVelocityVectors(throttle, pitch, LIFTCOEFFICENT) * 1.25
    missile.vel.y = calculateVerticalVelocityVectors(throttle, pitch, LIFTCOEFFICENT)
    missile.image = (imgMissile)
    missile.scale.x = -0.3;
    missile.scale.y = 0.3;
}


//--------------------------------------------
//calculate vertical and horizontal speeds based on pitch and throttle - vetical speed add gravity aswell
//functions take 3 input parameters - speed, angle of flight (pitch /AoA), and lift coeffient,
//functions return horizontal speed and vertical speed respectivily 
//--------------------------------------------
function calculateHorizontalVelocityVectors(_speed, _angle, _liftOfObject) {
    let horizontalSpeed = 0;
    horizontalSpeed = (Math.abs(_speed * (Math.cos(_angle) - Math.cos(90 - _angle) * _liftOfObject)));
    return horizontalSpeed;
}

function calculateVerticalVelocityVectors(_speed, _angle, _liftOfObject) {
    let verticalSpeed = 0;
    verticalSpeed = ((-1 * _speed * (Math.sin(_angle) + Math.sin(90 + _angle) * _liftOfObject)) + GRAVITY) * 1 / (FRAMERATE);

    if (verticalSpeed < -35) {
        verticalSpeed = -35;
    }

    return verticalSpeed;
}


//--------------------------------------------
//move camera & ground & the walls(top of frame to ensure player stays inside zone)
//takes input of percent per frame for the camera to move, higher percent creats less smooth movement
//--------------------------------------------
function moveCameraAndWallAndGround(_percentperframe) {
    camera.x += ((plane.x - camera.x) * (_percentperframe / 100)) + (1 / 14 * windowWidth);
    camera.y += (plane.y - camera.y) * (_percentperframe / 100);
    ground.x = camera.x;
    wallTop.x = camera.x;
    //console.log(camera.x);
    //console.log(plane.x)
}

//--------------------------------------------
    //Take keyboard input
    //--------------------------------------------
function takeKeyboardInput(){
    if (kb.pressing('w')) {
        if (throttle <= 120) {
            throttle = throttle * (1 + 0.1 / 6);
        }
    }

    if (kb.pressing('s')) {
        if (throttle >= 0.1) {
            throttle = throttle * (1 - 0.1 / 6);
        }
    }

    if (plane.colliding(ground) == false) {
        if (kb.pressing('a')) {
            if (pitch <= -65) {
                pitch = pitch;
            } else {
                pitch = pitch - (1 / 6 * Math.sqrt(throttle) * PITCHSENSITIVITY);
            }
        }

        if (kb.pressing('d')) {
            if (pitch >= 85) {
                pitch = pitch;
            } else {
                pitch = pitch + (1 / 6 * Math.sqrt(throttle) * PITCHSENSITIVITY)
            }
        }
    } else {
        pitch = 0;
    }

    if (kb.presses('space') && missileTimer == 0) {
        missileTimer = 300;
        launchMissile()
        console.log(mouseX, mouseY)
    }

    return pitch,missileTimer,throttle; 
}

function killEnemy(_enemyHit, _missile){
    let collisionSpeed = enemyGroup.vel.x;
    let collisionX = _enemyHit.x;
    let collisionY = _enemyHit.y;
    _missile.remove()
    _enemyHit.remove()
    for(i=0; i<100; i++){
        particle = new Sprite(collisionX,collisionY,5,'d')
        particle.color = '#FF7700';
        particle.vel.x = collisionSpeed * random(-100,100)/100;
        particle.vel.y = random(-50,50);
        particleGroup.add(particle)
        particleTimer=150;
    }
}



function draw() {


    enemyTimer -= 1;
    background('#0000ff');

    if (missileTimer >= 1) {
        //collider not working
        enemyGroup.collides(missile, killEnemy)
        missileTimer -= 1;
    }

    
    if(particleTimer == 1){
        particleGroup.deleteAll();
    }

    takeKeyboardInput()

    //spawn enemy
    if (enemyTimer <= 0) {
        createEnemy(plane.x, plane.y)
        enemyGroup.vel.x = calculateHorizontalVelocityVectors(throttle, 0, 1) + 10;
        enemyTimer = 500;
    }

    //missile movement & removal after time
    if (missileTimer != 0) {
        console.log('timer not=0')
        missile.x += (mouse.x - missile.x) * 0.075;
        missile.y += (mouse.y - missile.y) * 0.075;
    }
    if (missileTimer == 1) {
        missile.remove();
    }



    //move clouds accros screen
    if (cloud.x < camera.x - windowWidth / 2) {
        console.log('cloudIf')
        cloud.x = camera.x + windowWidth / 2;
    }

    //cloud velocity 
    cloud.vel.x = plane.vel.x / 3;

    moveCameraAndWallAndGround(20)
    //--------------------------------------------
    //Apply rotation and movement to the plane
    //--------------------------------------------
    enemyGroup.vel.x = calculateHorizontalVelocityVectors(throttle, 0, 1) + 3;

    plane.rotation = pitch;
    plane.vel.x = calculateHorizontalVelocityVectors(throttle, pitch, LIFTCOEFFICENT);
    plane.vel.y = calculateVerticalVelocityVectors(throttle, pitch, LIFTCOEFFICENT);
}