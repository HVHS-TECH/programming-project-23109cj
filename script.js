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
let enemyMissile;
let enemyMissileExists = false;
let gameRunning = true;
let chaffRemaining = 150;
let chaffGroup;

const GRAVITY = 0.15;
const LIFTCOEFFICENT = 0.3025;
const FRAMERATE = 60;
const PITCHSENSITIVITY = 0.22;
let groundHeight;       //as var so it can be read from all functions - value never changed after setup()
let screenWidth;        //as var so it can be read from all functions - value never changed after setup()
let screenHeight;       //as var so it can be read from all functions - value never changed after setup()


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
    //angleMode(DEGREES);
    screenHeight = windowHeight;
    screenWidth = windowWidth
    groundHeight = screenHeight - screenHeight / 6;

    cnv = new Canvas(screenWidth, screenHeight);

    cloud = new Sprite(screenWidth, random(0, groundHeight), 10, 10, 'n')
    cloud.image = (imgCloud);
    cloud.image.scale = 0.5;

    plane = new Sprite(screenWidth / 6, groundHeight, 20, 20, 'd');
    plane.image = (imgPlane);
    plane.image.scale.y = 0.1;
    plane.image.scale.x = -0.1;
    plane.bouncieness = 0;

    ground = new Sprite(screenWidth / 2, groundHeight / 3 * 4.35, screenWidth, groundHeight, 'k');
    ground.color = '#00ff00';
    ground.bouncieness = 0;

    wallTop = new Sprite(screenWidth / 2, screenHeight / 2 - screenHeight, screenWidth, 5, 'k')
    wallTop.visible = false;

    enemyGroup = new Group()
    particleGroup = new Group()
    chaffGroup = new Group()
}


function createEnemy(_playerX, _playerY) {
    console.log('createEnemy()')
    let inSky = false
    enemy = new Sprite(_playerX - screenWidth / 2, random(_playerY - 100, _playerY + 100), 80, 30, 'd')
    while (inSky == false) {
        if (enemy.overlaps(ground)) {
            enemy.y -= 100;
        } else {
            inSky = true;
        }
    }
    enemy.image = (imgEnemy);
    enemy.image.scale.y = 0.3;
    enemy.image.scale.x = -0.3;

    if (Math.round(Math.random(5) == 0)) {
        attackPlayer(enemy.x, enemy.y)
    }

    enemyGroup.add(enemy)
}


//--------------------------------------------------------
//Launch Missle
//creates a new sprite, calc its velocity to be faster than plane by 25%, assigns img
//--------------------------------------------------------
function launchMissile(_Xpos, _Ypos) {
    console.log('launchMissile()')
    missile = new Sprite(_Xpos - 20, _Ypos - 10, 40, 20, 'k');
    missile.vel.x = calculateHorizontalVelocityVectors(throttle, pitch, LIFTCOEFFICENT) * 1.25
    missile.vel.y = calculateVerticalVelocityVectors(throttle, pitch, LIFTCOEFFICENT)
    missile.image = (imgMissile)
    missile.scale.x = -0.3;
    missile.scale.y = 0.3;
    missile.life = 300;
}

//--------------------------------------------
//calculateHorizontalVelocityVectors(_speed, _angle, _liftOfObject)
//Calculates the horizontal velocity of a sprite based of the input speed, angle and lift coefficent
//Called:   In the draw loop (Every frame)
//Input:    _speed - Numerical value  greater than 0 - The current net speed of the sprite
//          _angle - Numerical value between -180 & 180 - the current angle of flight (Angle between direction of movement and horizontal) of the sprite 
//          _liftOfObject - numerical value - usualy between -1 & 1 - the greater the magnitude, the more prononced the movement
//Return:   horizontalSpeed - numerical value - the result of the calculations 
//--------------------------------------------
function calculateHorizontalVelocityVectors(_speed, _angle, _liftOfObject) {
    _angle = _angle * (Math.PI / 180)
    let horizontalSpeed = 0;
    horizontalSpeed = (Math.abs(_speed * (Math.cos(_angle) - Math.cos(90 - _angle) * _liftOfObject)));
    return horizontalSpeed;
}

//--------------------------------------------
//calculateVerticalVelocityVectors(_speed, _angle, _liftOfObject)
//Calculates the vertical velocity of a sprite based of the input speed, angle and lift coefficent
//Affected by FRAMERATE & GRAVITY constants
//Called:   In the draw loop (Every frame)
//Input:    _speed - Numerical value  greater than 0 - The current net speed of the sprite
//          _angle - Numerical value between -180 & 180 - the current angle of flight (Angle between direction of movement and horizontal) of the sprite 
//          _liftOfObject - numerical value - usualy between -1 & 1 - the greater the magnitude, the more prononced the movement
//Return:   verticalSpeed - numerical value >= -35 - the result of the calculations 
//--------------------------------------------
function calculateVerticalVelocityVectors(_speed, _angle, _liftOfObject) {
    _angle = _angle * (Math.PI / 180)
    let verticalSpeed = 0;
    verticalSpeed = ((-1 * Math.abs(_speed * (Math.sin(_angle) + Math.sin(90 + _angle) * _liftOfObject))) * 1 / (FRAMERATE)) + GRAVITY;

    if (verticalSpeed < -35) {
        verticalSpeed = -35;
    }

    return verticalSpeed;
}

//--------------------------------------------
//moveCameraAndWallAndGround(_percentPerFrame)
//moves all constant elements of the game (Camera, walls/roof, and the ground) to follow the plane
//Called:   In the draw loop (Every frame)
//Input:    _percentPerFrame - numerical value - between 0 & 100 - how much of the distance to the plane the elements move each frame - higher percentages result in jerky movement, lower result in the plane going off screen
//Return:   moves camera x,y towards the plane x,y
//          moves ground x towards the plane x
//          moves wallTop (roof) x towards the plane x
//--------------------------------------------
function moveCameraAndWallAndGround(_percentPerFrame) {
    camera.x += ((plane.x - camera.x) * (_percentPerFrame / 100)) + (1 / 14 * screenWidth);
    camera.y += (plane.y - camera.y) * (_percentPerFrame / 100);
    ground.x = camera.x;
    wallTop.x = camera.x;
}

//--------------------------------------------
//takeKeyboardInput()
//Recieves keyboard input and adjusts variables accordingly
//Called:   In the draw loop (Every frame)
//Input:    N/A
//Return:   Throttle - numerical value - between 0 & 120 - increased if w pressed, decreased if s pressed
//          Pitch - numerical value - between -65 & 65 - increased if a pressed, decreased is d pressed
//          MissileTimer - numerical value between 0 & 300- if space pressed set to 300, else no change
//--------------------------------------------
function takeKeyboardInput() {
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

    if (kb.presses('shift') && missileTimer <= 0) {
        missileTimer = 300;
        launchMissile(plane.x, plane.y)
        console.log(mouseX, mouseY)
    }



    if (kb.presses('space') && chaffRemaining > 9) {
        chaffRemaining -= 10;
        for (i = 0; i < 10; i++) {
            chaff = new Sprite(plane.x - 30, plane.y + random(-50, 50), 10, 'k');
            chaff.vel.x = calculateHorizontalVelocityVectors(throttle, 0, 1) * 0.5;
            chaff.color = "#ff7600"
            chaff.life = 240;
            chaffGroup.add(chaff)
        }
    }

    return pitch, missileTimer, throttle;
}

//--------------------------------------------
//killEnemy(_enemyHit, _missile)
//Interaction between missile and enemy - kills both when they collide
//Called:   when the player launched missile collides with an element of the enemyGroup
//Input:    _enemyHit - the spefic sprite within the enemyGroup that was hit
//          _missile - the missile that collides with the enemy
//Return:   removes both _enemyHit & _missile
//          creates 100 explosion particles with a lifetime of 150 frames
//--------------------------------------------

function killEnemy(_enemyHit, _missile) {
    console.log("killEnemy()")
    let collisionSpeed = calculateHorizontalVelocityVectors(throttle, 0, 1);
    let collisionX = _enemyHit.x;
    let collisionY = _enemyHit.y;
    _missile.remove()
    _enemyHit.remove()
    score += 1;
    for (i = 0; i < 100; i++) {
        particle = new Sprite(collisionX, collisionY, 5, 'd')
        particle.color = '#FF7700';
        particle.strokeWeight = 0;
        particle.vel.x = collisionSpeed + random(-30, 30);
        particle.vel.y = random(-50, 50);
        particle.life = 150;
        particleGroup.add(particle)
    }
}

//--------------------------------------------
//attackPlayer(_launchX, _launchY)
//Creates a new missile to attack the player
//Called:   In the createEnemy() function 
//Input:    _launchX - The X position of where the missile spawns  
//          _launchY - The Y position of where the missile spawns
//Return:   enemyMissile - Sprite, created at _launchX, _launchY, exists for 300 frames
//--------------------------------------------
function attackPlayer(_launchX, _launchY) {
    console.log('attackPlayer()');
    enemyMissile = new Sprite(_launchX, _launchY, 40, 20, 'k');
    enemyMissile.vel.x = calculateHorizontalVelocityVectors(throttle, 0, 1)
    enemyMissileExists = true;
    enemyMissile.image = (imgMissile)
    enemyMissile.scale.x = -0.3;
    enemyMissile.scale.y = 0.3;
    enemyMissile.life = 300;
}

//------------------------------------------------------
//draw loop
//runs every frame
//------------------------------------------------------
function draw() {
    if (gameRunning) {
        enemyTimer -= 1;
        background('#0000ff');
        takeKeyboardInput()

        //missile collisions
        if (missileTimer >= 1) {
            enemyGroup.collides(missile, killEnemy)
            missileTimer -= 1;
        }

        //enemies attacking player
        if (enemyMissileExists) {
            if (enemyMissile.removed) {
                enemyMissileExists = false;
            } else {
                enemyMissile.x += (plane.x - enemyMissile.x) * 0.05;
                enemyMissile.y += (plane.y - enemyMissile.y) * 0.05;
                if (enemyMissile.collides(plane)) {
                    alert("You died - your score was: " + score)
                    gameRunning = false;
                }
            }
        }

        //chaff collisions
        if (enemyMissileExists && chaffGroup.collides(enemyMissile)) {
            enemyMissile.remove()
            enemyMissileExists = false;
        }

        //spawn enemy
        if (enemyTimer <= 0) {
            createEnemy(plane.x, plane.y)
            enemyTimer = 500;
        }

        //missile movement & removal after time
        if (missileTimer != 0) {
            missile.x += (mouse.x - missile.x) * 0.075;
            missile.y += (mouse.y - missile.y) * 0.075;
        }

        //move clouds accros screen
        if (cloud.x < camera.x - screenWidth / 2) {
            cloud.x = camera.x + screenWidth / 2;
        }

        //cloud velocity 
        cloud.vel.x = plane.vel.x / 31.5;

        //move enemies so they are moving slightly faster than the plane
        enemyGroup.vel.x = plane.vel.x + 10;

        //Apply rotation and movement to the plane
        plane.rotation = pitch;
        plane.vel.x = calculateHorizontalVelocityVectors(throttle, pitch, LIFTCOEFFICENT);
        plane.vel.y = calculateVerticalVelocityVectors(throttle, pitch, LIFTCOEFFICENT);

        moveCameraAndWallAndGround(20)

        //updates score counter
        text("Score: " + score, 50, 100);
    }
}