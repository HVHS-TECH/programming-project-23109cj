console.log("script.js")

let throttle = 0;
let pitch = 0;

//plane source = https://images.fineartamerica.com/images-medium-large-5/2-illustration-of-an-a-7e-corsair-ii-inkworm.jpg

function preload() {

  imgPlane   = loadImage('A7.png');

}

function setup(){
    cnv = new Canvas(windowWidth, windowHeight);
    const GROUND_HEIGHT = windowHeight - windowHeight/6;


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

    if(kb.pressing ('w')){
        if(throttle == 0){
            throttle = 0.1;
        }else {
               throttle = throttle* 1.01;
        }
    }

    if(kb.pressing ('s')){
        throttle = throttle* 0.99;
    }

    if(kb.pressing ('a')){
        if(pitch <= -85){
            pitch = pitch;
        } else{
                pitch = pitch - (1 * throttle)
        }
    }

    if(kb.pressing ('d')){
        if(pitch >= 85){
            pitch = pitch;
        } else{
                pitch = pitch + (1 * throttle)
        }
    }
    console.log(pitch)
    plane.rotation = pitch
    plane.vel.x = throttle;



}