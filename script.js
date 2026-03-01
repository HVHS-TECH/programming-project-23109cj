console.log("script.js")

//plane source = https://images.fineartamerica.com/images-medium-large-5/2-illustration-of-an-a-7e-corsair-ii-inkworm.jpg



function setup(){
    cnv = new Canvas(windowWidth, windowHeight);
    const GROUND_HEIGHT = windowHeight - windowHeight/6;


    plane = new Sprite(windowWidth/6, GROUND_HEIGHT, 40, 20);
}

function draw(){
    background('#0000ff');

}