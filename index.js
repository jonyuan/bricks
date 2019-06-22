var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");

// game state
var score = 0;
var lives = 3;
var ballSpeed = 3;
var paddleSensitivity = 7;
var paused = false;

// global variables for positioning the ball
var x = canvas.width/2;
var y = canvas.height-30;
var dx = ballSpeed;
var dy = -ballSpeed;
var ballRadius = 10;

// variables for positioning the paddle
var paddleHeight = 10;
var paddleWidth = 70;
var paddleX = (canvas.width-paddleWidth) / 2;

// variables for keyboard controls
var rightPressed = false;
var leftPressed = false;

// variables for defining the brick field
var brickRowCount = 8;
var brickColumnCount = 10;
var brickWidth = 33;
var brickHeight = 25;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;

var bricks = [];
// function for randomizing brick alive status: returns 1 or 0
function brickRandomizer() {
	return Math.floor(Math.random() * 2);
}

// function for randomizing brick strength
function strengthRandomizer() {
	return Math.floor(Math.random() * 4);
}
for(var c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(var r=0; r<brickRowCount; r++) {
    	// initialize them
        bricks[c][r] = { 
        	x: 0, 
        	y: 0,
        	// we want a random pattern of bricks
        	alive: brickRandomizer(), 
        	strength: strengthRandomizer()
        };
    }
}

//////// DYNAMIC DRAWING FUNCTIONS /////////

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
	ctx.beginPath();
	ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
	ctx.fillStyle = '#0095DD';
	ctx.fill();
	ctx.closePath();
}

function drawBricks() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
        	if(bricks[c][r].alive == 1) {
	            var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
	            var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
	            var brickStrength = 3 - bricks[c][r].strength;
	            bricks[c][r].x = brickX;
	            bricks[c][r].y = brickY;
	            ctx.beginPath();
	            ctx.rect(brickX, brickY, brickWidth, brickHeight);
	            ctx.fillStyle = 'rgba(' + `${40 * brickStrength}` + 
	            	',' + `${40 * brickStrength}` + ',' + `${40 * brickStrength}` + ', 0.5)';
	            ctx.fill();
	            ctx.closePath();
	        }
	    }
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

function drawPause() {
	ctx.font = "16px Arial";
	ctx.fillStyle = "black";
	ctx.fillText("Paused", canvas.width / 2 - 30, canvas.height / 2);

	ctx.beginPath();
	ctx.rect(canvas.width / 2 - 60, canvas.height / 2 - 30, 120, 50);
	ctx.fillStyle = 'rgba(129, 207, 224, 0.3)';
	ctx.fill();
	ctx.closePath();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clears area inside this rectangle
    drawBall();
    x += dx;
    y += dy;
    if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    	dx = -dx;
	}

	if(y + dy < ballRadius) {
	    dy = -dy;
	} else if(y + dy > canvas.height-ballRadius) {
		// the ball is on the bottom side
		if(x > paddleX && x < paddleX + paddleWidth) {
        	dy = -dy;
    	} else {
		    lives--;
			if(!lives) {
			    alert("GAME OVER");
			    document.location.reload();
			  	//clearInterval(interval);
			}
			else {
			    x = canvas.width/2;
			    y = canvas.height-30;
			    dx = ballSpeed;
			    dy = -ballSpeed;
			    paddleX = (canvas.width-paddleWidth)/2;
			}
		}
	}
	drawPaddle();
	if(rightPressed && paddleX < canvas.width - paddleWidth) {
    	paddleX += paddleSensitivity;
	}
	else if(leftPressed && paddleX > 0) {
	    paddleX -= paddleSensitivity;
	}
	drawBricks();
	collisionDetection();
	drawScore();
	drawLives();
	if (paused) {
		requestAnimationFrame(pause);
	} else {
		requestAnimationFrame(draw);
	}
}

function pause() {
	if (!paused) {
		setTimeout(requestAnimationFrame(draw), 1000);
	} else {
		drawPause();
		requestAnimationFrame(pause);
	}
}

// keyboard logic
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("keypress", keyPressHandler, false);

function keyPressHandler(e) {
	if (e.key == 'p') {
		paused = !paused;
	}
}

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

// collision detection logic
function collisionDetection() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            // calculations
            if(b.alive == 1) {
                if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    dy = -dy;
                    if (b.strength === 0) {
                    	b.alive = 0;
                    	score = score + 10;
	                    if(score == brickRowCount*brickColumnCount*10) {
	                        alert('You win!');
	                        document.location.reload();
	                    }
	                }
	                b.strength--;
                }
            }
        }
    }
}

// drawing intervals
//var interval = setInterval(draw, 5);
draw();