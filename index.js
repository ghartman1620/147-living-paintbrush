const WIDTH = 1900;
const HEIGHT = 960;

// Computes the distance between two points. For use in deciding when to add new points to a vine.

function dist(x1, y1, x2, y2) {
    return sqrt((x1-x2)^2 + (y1-y2)^2)
}

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

function petal(a, b, l, theta) {
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
    let petal = {p1x, p1y, p2x, p2y, curve1control1x, curve1control1y, curve1control2x, curve1control2y, curve2control1x, curve2control1y, curve2control2x, curve2control2y};
    
    petal.draw = function(rx, ry) {
        
        curve(this.curve1control1x + rx, -this.curve1control1y + ry, this.p1x + rx, -this.p1y + ry, this.p2x + rx, -this.p2y + ry, this.curve1control2x + rx, -this.curve1control2y + ry);
        curve(this.curve2control1x + rx, -this.curve2control1y + ry, this.p1x + rx, -this.p1y + ry, this.p2x + rx, -this.p2y + ry, this.curve2control2x + rx, -this.curve2control2y + ry);   
    }
    return petal;
}

function setup() {
    createCanvas(WIDTH, HEIGHT);
}

const FLOWER_A = 30;
function flower(offsetX, offsetY, numPetals, numLayers, height, width, r, g, b) {
    let flower = {offsetX, offsetY, numPetals, height, width, r, g, b, numLayers, petals: []};
    // Create the first layer of petals. The first layer has numPetals petals
    // and we'll use their positions to determine the petals in the other layers.
    let petalAngles = [];
    for(let theta = 0; theta < 2*PI; theta += 2*PI/flower.numPetals) {
        petalAngles.push(theta);
        flower.petals.push(petal(FLOWER_A, flower.width, flower.height, theta));
    }
    
    petalAngles.push(2*PI);
    // For each layer not the first
    for(let i = 1; i < numLayers; i++) {

        // Create a new petal for each gap between two petals in the previous layers
        for(let j = 0; j < petalAngles.length-1; j+=2) {
            let theta = (petalAngles[j] + petalAngles[j+1])/2;
            petalAngles.splice(j+1, 0, theta);
            flower.petals.push(petal(FLOWER_A, flower.width, flower.height+i*(flower.height/3), theta));
        }
    }
    flower.draw = function(x, y) {
        fill(this.r, this.g, this.b);
        strokeWeight(.5);
        stroke(255,255,255);
        for(const petal of this.petals) {
            petal.draw(x, y);
        }
        
    }
    return flower;
}

function rectObj(x, y, width, height, r, g, b) {
    let rec = {
        x, y, width, height, r, g, b,
        enteredMouseX: undefined,
        enteredMouseY: undefined,
        containsPoint: function(x, y) {
            return x > this.x && y > this.y && x <= this.x + this.width && y <= this.y + this.height
        },
        // This function is a little bit hand-wavey, but what it does is this shape is
        // allowed to determine what the next point on the vine should be given a mouse cursor position in it.
        // For this particular rectangle, it will wrap around the rectangle like a cos wave.
        translatePoint: function(x, y) {
            // y plus some oscillating offset. the height of the oscillation is determined by how close the cursor is on y to the center of this rect.
            // if the cursor is very close to the center of the rect, it oscillates over the whole rect. if it's close to the edge it doesn't oscillate
            // and accepts the given y.
            
            let differenceFromMid = (this.height-abs(y - (this.y + this.height/2)))
            let xMultiplier = cos((x-this.enteredMouseX)/200)
            if(this.enteredMouseY < (this.y+this.height/2)) {
                return {x,  y: y - cos((x-this.enteredMouseX)/200)* (this.height/2-abs(y - (this.y + this.height/2)))}
            } else {
                return {x, y: y + cos((x-this.enteredMouseX)/200)* (this.height/2-abs(y - (this.y + this.height/2)))}
            }

        },
        validPointChange: function(x, y) {
            return abs(x - points[points.length-1].x) > 3
        },
    };
    return rec;
    
}

const points = [];
const rectangles = [];
rectangles.push(rectObj(0, 400, WIDTH, 200, 211, 211, 211));


// Adds a point to the vine, moving the vine growth forward.
function addPoint(x, y) {
    points.push({
        x,
        y,
        // these may be different, like the translate point i do on the rect. so we can't have
        // a bunch fo points being created even if the mouse isn't moving.
        mouseX,
        mouseY,
        width: undefined,
        flowers: [],
    });
    let i = 0;
    for(let point of points) {
        i++;
    }
    for(let i = points.length-1; i >= 1; i--) {
        points[i].width = points[i-1].width;
        points[i].flowers = Object.assign([], points[i-1].flowers);
    }
    points[0].flowers = [];
    points[0].width = 4+6*abs(sin(points.length/20));
}

function draw() { 
    clear();
    
    if(points.length === 0){
        addPoint(mouseX, mouseY);
    }
    let rectWithMouse = undefined;
    for(const recta of rectangles) {
        fill(recta.r, recta.g, recta.b);
        strokeWeight(0);
        rect(recta.x, recta.y, recta.width, recta.height);
        
        
        if(recta.containsPoint(mouseX, mouseY)) {
            rectWithMouse = recta;
            if(recta.enteredMouseX === undefined) {
                recta.enteredMouseX = mouseX;
                recta.enteredMouseY = mouseY;
            }
        } else {
            recta.enteredMouseX = undefined;
            recta.enteredMouseY = undefined;
        }
    }
    if((dist(points[points.length-1].mouseX, points[points.length-1].mouseY, mouseX, mouseY) > 2)
      && mouseX > 0 && mouseX < WIDTH && mouseY > 0 && mouseY < HEIGHT){
        if(rectWithMouse) {
            let pt = rectWithMouse.translatePoint(mouseX, mouseY);
            addPoint(pt.x, pt.y);

        } else {
            addPoint(mouseX, mouseY);
        }
    }
    

    
    for(let i = 0; i < points.length; i++) {
        if(i >= 3) {
            strokeWeight(points[i-3].width);
            stroke(34, 139, 34);
            noFill();
            curve(points[i-3].x, points[i-3].y, points[i-2].x, points[i-2].y, points[i-1].x, points[i-1].y, points[i].x, points[i].y);
            if(points[i].extension !== undefined) {
                strokeWeight(points[i].width);

                line(points[i].x, points[i].y, points[i].extension.x, points[i].extension.y);
            }

            
        }
        
    }
    for(let point of points) {
        for(let flower of point.flowers) {
            flower.draw(point.x, point.y);
        }
    }
    
}

function mousePressed() {
    let flowerX = random(-25, 25) + points[points.length-1].x;
    let flowerY = random(-25, 25) + points[points.length-1].y;
    let flo = flower(random(-25, 25), random(-25, 25), round(random(3, 15)), round(random(1,3)), random(10, 60), random(10, 80), random(0, 255), random(0, 255), random(0, 255))
    points[0].flowers.push(flo);
    // flo.draw(points[0].x, points[0].y);
}