console.log("script.js")

let throttle = 0.5;
let pitch = 0;

const GRAVITY = 5;
const LIFTCOEFFICENT =0.3025;
const DRAG = 6;
const FRAMERATE = 10;
const PITCHSENSITIVITY = 0.5;


//plane img source = https://images.fineartamerica.com/images-medium-large-5/2-illustration-of-an-a-7e-corsair-ii-inkworm.jpg

function preload() {
    console.log('preload()')
    imgPlane   = loadImage('A7.png');
    imgCloud   = loadImage('Cloud.png');
    
}

function setup(){
    console.log('setup()')
    frameRate(FRAMERATE)
    angleMode(DEGREES);
    const GROUND_HEIGHT = windowHeight - windowHeight/6;
    createClouds(GROUND_HEIGHT);

    cnv = new Canvas(windowWidth, windowHeight);

    plane = new Sprite(windowWidth/6, GROUND_HEIGHT, 20, 20, 'd');
    plane.image = (imgPlane);
    plane.image.scale.y = 0.1;
    plane.image.scale.x = -0.1;
    plane.drag = DRAG; 
    plane.bouncieness = 0;

    ground = new Sprite(windowWidth/2, GROUND_HEIGHT/3 *4.35, windowWidth, GROUND_HEIGHT, 'k');
    ground.color = '#00ff00';
    ground.bouncieness = 0;

    wallLeft = new Sprite(0,windowHeight/2,5, windowHeight, 'k')
    wallLeft.visible = false;

}

//-------------------------------------------------------
//create clouds
//-------------------------------------------------------
function createClouds(_groundHeight){
    cloudGroup = new Group();
    for(i=0; i<=2; i++){
        cloud = new Sprite(windowWidth, random(0,_groundHeight), 10, 10, 'n')
        cloud.image = (imgCloud);
        cloud.image.scale = 0.5;
        cloudGroup.add(cloud);
    }
}

//--------------------------------------------
//calculate vertical and horizontal speeds based on pitch and throttle - vetical speed add gravity aswell
//functions take 3 input parameters - speed, angle of flight (pitch /AoA), and lift coeffient,
//functions return horizontal speed and vertical speed respectivily 
//--------------------------------------------

function calculateHorizontalVelocityVectors(_speed, _angle, _liftOfObject){
    let horizontalSpeed = 0;
    horizontalSpeed = (Math.abs( _speed * (Math.cos(_angle) - Math.cos(90 - _angle) * _liftOfObject)));
    return horizontalSpeed;
}
    
function calculateVerticalVelocityVectors(_speed, _angle, _liftOfObject){
    let verticalSpeed = 0;
    verticalSpeed = (( -1 * _speed * (Math.sin(_angle) + Math.sin(90 + _angle) * _liftOfObject)) + GRAVITY) * 1/(FRAMERATE);
    
    if(verticalSpeed < -35){
        verticalSpeed = -35;
    }

    console.log(pitch)
    console.log(verticalSpeed)
    return verticalSpeed;
}

//not moving to right side of screen not worring right now
function moveCloud(_cloudMoved, _wallLeft){
        _cloudMoved.moveTo(windowWidth, random(0,GROUND_HEIGHT));
    }



function moveCameraAndGround(_percentperframe){
    camera.x += (plane.x - camera.x) * (_percentperframe/100) + 2/6 * windowWidth;
    camera.y += (plane.y - camera.y) * (_percentperframe/100);
    ground.x = camera .x; 
}

function draw(){
    //console.log('draw()')
    background('#0000ff');
    
    //--------------------------------------------
    //Take keyboard input
    //--------------------------------------------
    if(kb.pressing ('w')){
        if(throttle <= 120){
            throttle = throttle * 1.1;
        }
    }

    if(kb.pressing ('s')){
        if(throttle >= 0.1){
            throttle = throttle * 0.99;
        }
    }
    if(plane.colliding(ground) == false){
        if(kb.pressing ('a')){
            if(pitch <= -65){
                pitch = pitch;
            } else{
                    pitch = pitch - (1 * Math.sqrt(throttle) * PITCHSENSITIVITY);
            }
        }

        if(kb.pressing ('d')){
            if(pitch >= 85){
                pitch = pitch;
            } else{
                    pitch = pitch + (1 * Math.sqrt(throttle) * PITCHSENSITIVITY)
            }
        }    
    }else {
        pitch = 0;
        plane.rotation = 0;
    }


    //
    cloudGroup.collides(wallLeft, moveCloud)
    
    //--------------------------------------------
    //move camera & ground
    //--------------------------------------------
    moveCameraAndGround(100)
        //camera.moveTo(plane.x + 2/6 * windowWidth, plane.y, 100);

    //--------------------------------------------
    //Apply rotation and movement to the plane
    //--------------------------------------------
        plane.rotation = pitch;
        plane.vel.x = calculateHorizontalVelocityVectors(throttle,pitch,LIFTCOEFFICENT);
        plane.vel.y = calculateVerticalVelocityVectors(throttle,pitch,LIFTCOEFFICENT);

}