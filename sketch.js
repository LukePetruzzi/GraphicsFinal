// const p5 = new p5();

var mic;
function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    mic = new p5.AudioIn()
    mic.start();
}
function draw() {
    background(0);

    micLevel = mic.getLevel();
    ellipse(0, constrain(height - micLevel * height * 5, 0, height), 10, 10);
}