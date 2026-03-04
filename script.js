console.log("script.js")

let throttle = 0.5;
let pitch = 0;
let verticalSpeed = 0;
let horizontalSpeed = 0;
const GRAVITY = 5;
const LIFTCOEFFICENT =0.3;

//plane source = https://images.fineartamerica.com/images-medium-large-5/2-illustration-of-an-a-7e-corsair-ii-inkworm.jpg

function preload() {

  imgPlane   = loadImage('A7.png');

}

function setup(){
    world.gravity.y = 10;
    cnv = new Canvas(windowWidth, windowHeight);
    const GROUND_HEIGHT = windowHeight - windowHeight/6;
    angleMode(DEGREES);

    plane = new Sprite(windowWidth/6, 600, 40, 20, 'd');
    plane.image = (imgPlane);
    plane.image.scale.y = 0.1;
    plane.image.scale.x = -0.1; 

    
    //plane.vel.x=10
    //plane.vel.y=-1
    ground = new Sprite(windowWidth/2, GROUND_HEIGHT/3 *4.35, windowWidth, GROUND_HEIGHT, 'k');
    ground.color = '#00ff00';
}





function draw(){
    background('#0000ff');


    //--------------------------------------------
    //Take keyboard input
    //--------------------------------------------
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

    //--------------------------------------------
    //calculate vertical and horizontal speeds based on pitch and throttle - vetical speed add gravity aswell
    //--------------------------------------------
    horizontalSpeed = Math.abs( throttle);
    
    verticalSpeed = verticalSpeed - (LIFTCOEFFICENT * throttle * Math.sin(pitch))  + GRAVITY;

    //--------------------------------------------
    //Apply rotation and movement to the plane
    //--------------------------------------------
    plane.rotation = pitch;
    plane.vel.x = horizontalSpeed;
    plane.vel.y = verticalSpeed;

}