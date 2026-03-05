console.log("script.js")

let throttle = 0.5;
let pitch = 0;

const GRAVITY = 5;
const LIFTCOEFFICENT =0.3;
const DRAG = 6;

//plane source = https://images.fineartamerica.com/images-medium-large-5/2-illustration-of-an-a-7e-corsair-ii-inkworm.jpg

function preload() {

  imgPlane   = loadImage('A7.png');

}

function setup(){

    frameRate(10)

    cnv = new Canvas(windowWidth, windowHeight);
    const GROUND_HEIGHT = windowHeight - windowHeight/6;
    angleMode(DEGREES);

    plane = new Sprite(windowWidth/6, GROUND_HEIGHT, 20, 20, 'd');
    plane.image = (imgPlane);
    plane.image.scale.y = 0.1;
    plane.image.scale.x = -0.1;
    plane.drag = DRAG; 
    plane.bouncieness = 0;

    ground = new Sprite(windowWidth/2, GROUND_HEIGHT/3 *4.35, windowWidth, GROUND_HEIGHT, 'k');
    ground.color = '#00ff00';
    ground.bouncieness = 0;

}


//--------------------------------------------
    //Take keyboard input
    //--------------------------------------------
function keyboardInput(){
        if(kb.pressing ('w')){
            if(throttle <= 60){
                throttle = throttle * 1.1;
            }
        }

        if(kb.pressing ('s')){
            if(throttle >= 0.1){
                throttle = throttle * 0.99;
            }
        }

        if(kb.pressing ('a')){
            if(pitch <= -65){
                pitch = pitch;
            } else{
                    pitch = pitch - (1 * Math.sqrt(throttle));
            }
        }

        if(kb.pressing ('d')){
            if(pitch >= 85){
                pitch = pitch;
            } else{
                    pitch = pitch + (1 * Math.sqrt(throttle))
            }
        }
        return pitch, throttle;
    }


//--------------------------------------------
//calculate vertical and horizontal speeds based on pitch and throttle - vetical speed add gravity aswell
//--------------------------------------------

function calculateVelocityVectors(_speed, _angle, _liftOfObject){
    horizontalSpeed = Math.abs( _speed * (Math.cos(_angle) - Math.cos(90 - _angle) * _liftOfObject));
    verticalSpeed = (-1 * _speed * (Math.sin(_angle) + Math.sin(90 - _angle) * _liftOfObject)) + GRAVITY;
    return horizontalSpeed, verticalSpeed;
}
    
function draw(){
    let verticalSpeed = 0;
    let horizontalSpeed = 0;
    background('#0000ff');

    keyboardInput()    
    calculateVelocityVectors(throttle,pitch,LIFTCOEFFICENT)

    //--------------------------------------------
    //move camera & ground
    //--------------------------------------------
        camera.moveTo(plane.x + 2/6 * windowWidth, plane.y, 12);
        //ground.x = (camera.x);


    //--------------------------------------------
    //Apply rotation and movement to the plane
    //--------------------------------------------
        plane.rotation = pitch;
        plane.vel.x = horizontalSpeed;
        plane.vel.y = verticalSpeed;
        console.log(plane.x)
        console.log(plane.y)

}