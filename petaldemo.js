const WIDTH = 640;
const HEIGHT = 480;
function setup() {
    createCanvas(WIDTH, HEIGHT);
}

let x1 = 100;
let y1 = 100;

let i = 0;


// Wish I could put my board drawing here to explain this code. It's much more difficult to explain in words.
    
    
// I want a function that draws petals. I want to be able to draw them all with respect to the same point,
// so I can make a flower. rx and ry are the center of that flower.

// Theta is then the angle between the horizontal (remember, theta = 0 is a petal pointed to the right, the origin of the unit circle)
// l is the length of the petal.
// a and b are the offset from the points at the end of the flower for the control points as drawn in the curve() function.
// In general, higher a makes the petal thinner and higher b makes the flower wider.

// We must draw our petals in terms of the x and y components of a, b, and l. 

// The angle of l from the origin is theta, given.
// The angle of a from the origin is theta + pi, or an angle opposite theta.
// The angle of b from the origin is theta - pi/2, or an angle orthogonal to theta.

// We'll start by computing every point with respect to euclidean coordinates so we can leverage the sign power of sin and cos.
// Only at the end will we draw these petals with respect to the graphical origin, (0, 0) at the top left of the screen.
// To do this change from euclidean coordinates to (0, 0) in the top left, we'll add the root x and y values to all of our computed
// coordinates. We must also reverse the sign of our computed y coordinates, as euclidean coordinates positive y is up but in our 
// computer graphics positive y is down.

function petal(rx, ry, a, b, l, theta) {
    // Determine the components of l
    let lx = l*cos(theta);
    let ly = l*sin(theta);

    // Determine the components of a
    let ax = a*cos(theta+PI);
    let ay = a*sin(theta+PI);
    
    // Determine the components of b
    let bx = b*cos(theta-HALF_PI);
    let by = b*sin(theta-HALF_PI);
    
    // Determine the two points to be connected by our flower petal curves
    
    let p1x = 0;
    let p1y = 0;
    let p2x = lx;
    let p2y = ly;
    
    // Determine the control points for the first curve. These will draw the "right" half of the petal. (if the petal is facing upward)
    
    let curve1control1x = ax + bx;
    let curve1control1y = ay + by;
    
    let curve1control2x = -ax + bx;
    let curve1control2y = -ay + by;
    
    // Determine the control points for the second curve. These will draw the "left" half of the petal. (if the petal is facing upward)
    
    let curve2control1x = ax - bx;
    let curve2control1y = ay - by;
    
    let curve2control2x = -ax - bx;
    let curve2control2y = -ay - by;
    
    // Now we must draw the two curves. Thus far, every point we've determined is in euclidean coordinates, so some might be negative.
    // To rectify this and draw them on the screen, we'll add the origin of the petal (rx, ry) to each.

    curve(curve1control1x + rx, -curve1control1y + ry, p1x + rx, -p1y + ry, p2x + rx, -p2y + ry, curve1control2x + rx, -curve1control2y + ry);
    curve(curve2control1x + rx, -curve2control1y + ry, p1x + rx, -p1y + ry, p2x + rx, -p2y + ry, curve2control2x + rx, -curve2control2y + ry);
}

const FLOWER_A = 30;
function flower(x, y, numPetals, height, width, r, g, b) {
    let flower = {numPetals, height, width, r, g, b, x, y}
    flower.draw = function() {
        fill(this.r, this.g, this.b);
        for(let theta = 0; theta <= 2*PI; theta += 2*PI/this.numPetals) {
            console.log("petal: " + this.x);
            console.log(this.y);
            console.log(FLOWER_A);
            console.log(this.width);
            console.log(this.height);
            console.log(theta);
            petal(this.x, this.y, FLOWER_A, this.width, this.height, theta);
        }
    }
    return flower;
}
let j = 0;
function draw() {
    let flo = flower(100, 100, 5, 50, 30, 255, 0, 0);
    if(j ==0){
        flo.draw();
        j++;
    }
//    for(let theta = 0; theta <= 2*PI; theta += 2*PI/5) {
//        petal(100, 100, 30, 50, 50, theta);
//    }
}