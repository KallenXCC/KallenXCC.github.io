var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

context.fillStyle = 'black';
context.fillRect(0, 0, canvas.width, canvas.height);

var grid = 16;
var count = 0;

var score = 0;
document.getElementById("displayScore").innerHTML = score;
var highScore = localStorage.getItem("highScore");
if (highScore !== null) {
  // Use the saved score in your game logic
  console.log("High Score:", highScore);
} else {
  highScore = 0;
}
document.getElementById("displayHighScore").innerHTML = highScore;
  
var snake = {
  x: 160,
  y: 160,
  
  // snake velocity. moves one grid length every frame in either the x or y direction
  dx: 0,
  dy: grid,
  
  // keep track of all grids the snake body occupies
  cells: [],
  
  // length of the snake. grows when eating an apple
  maxCells: 4
};
var apple = {
  x: 320,
  y: 320
};

// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// game loop
function loop() {
  requestAnimationFrame(loop);

  // slow game loop to 15 fps instead of 60 (60/15 = 4)
  if (++count < 4) {
    return;
  }

  count = 0;
  //context.clearRect(0,0,canvas.width,canvas.height);

  // move snake by it's velocity
  snake.x += snake.dx;
  snake.y += snake.dy;

  // wrap snake position horizontally on edge of screen
  if (snake.x < 0) {
    snake.x = canvas.width - grid;
  }
  else if (snake.x >= canvas.width) {
    snake.x = 0;
  }
  
  // wrap snake position vertically on edge of screen
  if (snake.y < 0) {
    snake.y = canvas.height - grid;
  }
  else if (snake.y >= canvas.height) {
    snake.y = 0;
  }

  // keep track of where snake has been. front of the array is always the head
  snake.cells.unshift({x: snake.x, y: snake.y});

  // remove cells as we move away from them
  if (snake.cells.length > snake.maxCells) {
    tail = snake.cells.pop();
    context.clearRect(tail.x, tail.y, grid, grid);
  }

  head = snake.cells.at(0);
  context.clearRect(head.x, head.y, grid, grid);

  // draw apple
  context.fillStyle = 'red';
  context.fillRect(apple.x, apple.y, grid-1, grid-1);

  // draw snake one cell at a time
  context.fillStyle = '#AACCFF';
  snake.cells.forEach(function(cell, index) {
    
    // drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
    context.fillRect(cell.x, cell.y, grid-1, grid-1);  

    // snake ate apple
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      score += 100;
      document.getElementById("displayScore").innerHTML = score;

      // canvas is 400x400 which is 25x25 grids 
      apple.x = getRandomInt(0, 25) * grid;
      apple.y = getRandomInt(0, 25) * grid;
    }

    // check collision with all cells after this one (modified bubble sort)
    for (var i = index + 1; i < snake.cells.length; i++) {
      
      // snake occupies same space as a body part. reset game
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        snake.x = 160;
        snake.y = 160;
        snake.cells = [];
        snake.maxCells = 4;
        snake.dx = 0;
        snake.dy = grid;

        apple.x = getRandomInt(0, 25) * grid;
        apple.y = getRandomInt(0, 25) * grid;

        if (score > highScore) {
          highScore = score;
          document.getElementById("displayHighScore").innerHTML = highScore;        
          if(localStorage) {
            localStorage.setItem("highScore", score);
          }
        }
        score = 0;
        document.getElementById("displayScore").innerHTML = score;
      }
    }
  });
}

function moveSnake(dir) {
  // prevent snake from backtracking on itself by checking that it's 
  // not already moving on the same axis (pressing left while moving
  // left won't do anything, and pressing right while moving left
  // shouldn't let you collide with your own body)
  if (dir === "l" && snake.dx === 0) {
    snake.dx = -grid;
    snake.dy = 0;
  }
  else if (dir === "u" && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  }
  else if (dir === "r" && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  }
  else if (dir === "d" && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
}

// listen to keyboard events to move the snake
document.addEventListener('keydown', function(e) {
  // left arrow key or 'A' key
  if (e.which === 37 || e.which === 65) {
    moveSnake("l");
  }
  // up arrow key or w key
  else if (e.which === 38 || e.which === 87) {
    moveSnake("u");
  }
  // right arrow key or d key
  else if (e.which === 39 || e.which === 68) {
    moveSnake("r");
  }
  // down arrow key or s key
  else if (e.which === 40 || e.which === 83) {
    moveSnake("d");
  }
});

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     
                                                                         
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
                                                                         
function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            moveSnake("l"); 
        } else {
            moveSnake("r");
        }                       
    } else {
        if ( yDiff > 0 ) {
            moveSnake("u"); 
        } else { 
            moveSnake("d");
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};

// start the game
requestAnimationFrame(loop);