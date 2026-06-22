const CANVAS_W = 800;
const CANVAS_H = 800;
const WORLD_W = 2000;
const WORLD_H = 1600;
const PLAYER_SPEED = 3.2;
const PLAYER_RADIUS = 30;
const FLASHLIGHT_DISTANCE = 300;
const FLASHLIGHT_ANGLE = Math.PI / 2;
const CAM_SMOOTHING = 0.08;

let player;
let camera;
let walls = [];
let keyItem;
let door;
let gameState;
let pressedKeys = {};

// Tile map variables (loaded from data/blocks.json)
let tileWallImg, tileCornerImg, tileFloorImg;
let tileMapData;
let TILE_SIZE = 40;
let mapCols = 50;
let mapRows = 40;

function preload() {
  // Load tile images and the tilemap JSON
  tileWallImg = loadImage("assets/images/wall.png");
  tileCornerImg = loadImage("assets/images/corner.png");
  tileFloorImg = loadImage("assets/images/floor.png");
  playerImg = loadImage("assets/images/maincharacter.png");
  tileMapData = loadJSON("data/blocks.json");
}

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  textFont("monospace");
  noCursor();
  camera = { x: 0, y: 0 };

  // If the JSON provided different sizing, use it
  if (tileMapData) {
    TILE_SIZE = tileMapData.tileSize || TILE_SIZE;
    mapCols = tileMapData.cols || mapCols;
    mapRows = tileMapData.rows || mapRows;
  }

  initGame();
}

function initGame() {
  player = {
    x: 200,
    y: 200,
    r: PLAYER_RADIUS,
    hasKey: false,
  };

  // Build walls from tile map JSON
  walls = [];
  if (tileMapData && tileMapData.tiles) {
    for (let row = 0; row < mapRows; row++) {
      let line = tileMapData.tiles[row] || "";
      for (let col = 0; col < mapCols; col++) {
        let ch = line[col] || ".";
        // Check for wall tiles (W, L, B, R, T) and corner tiles (C, N, E, S, W)
        if (
          ch === "W" ||
          ch === "C" ||
          ch === "L" ||
          ch === "B" ||
          ch === "R" ||
          ch === "T" ||
          ch === "N" ||
          ch === "E" ||
          ch === "S"
        ) {
          walls.push({
            x: col * TILE_SIZE,
            y: row * TILE_SIZE,
            w: TILE_SIZE,
            h: TILE_SIZE,
          });
        }
      }
    }
  }

  // Ensure player doesn't start inside a wall tile; move to first floor tile if needed
  if (
    (tileMapData &&
      tileMapData.tiles &&
      collidesWithWalls(player.x, player.y)) ||
    (!tileMapData && collidesWithWalls(player.x, player.y))
  ) {
    let found = false;
    for (let row = 0; row < mapRows && !found; row++) {
      let line = tileMapData.tiles[row] || "";
      for (let col = 0; col < mapCols; col++) {
        let ch = line[col] || ".";
        if (ch === ".") {
          player.x = col * TILE_SIZE + TILE_SIZE / 2;
          player.y = row * TILE_SIZE + TILE_SIZE / 2;
          found = true;
          break;
        }
      }
    }
  }

  keyItem = {
    x: 1300,
    y: 950,
    r: 14,
    collected: false,
  };

  door = {
    x: WORLD_W - 80,
    y: 700,
    w: 50,
    h: 200,
    isOpen: false,
  };

  gameState = "play";
}

function draw() {
  background(20);

  if (gameState === "play") {
    updatePlayer();
    checkKeyPickup();
    checkWinCondition();
  }

  updateCamera();

  push();
  translate(-camera.x, -camera.y);

  drawRoom();
  drawFog();
  drawDoor();
  drawPlayer();
  drawKey();

  pop();

  drawUI();

  if (gameState === "win") drawWinScreen();
}

function updateCamera() {
  let targetX = player.x - CANVAS_W / 2;
  let targetY = player.y - CANVAS_H / 2;

  targetX = constrain(targetX, 0, WORLD_W - CANVAS_W);
  targetY = constrain(targetY, 0, WORLD_H - CANVAS_H);

  camera.x = lerp(camera.x, targetX, CAM_SMOOTHING);
  camera.y = lerp(camera.y, targetY, CAM_SMOOTHING);
}

function updatePlayer() {
  let moveX = 0;
  let moveY = 0;

  // Arrow keys via keyIsDown
  if (keyIsDown(LEFT_ARROW)) moveX -= PLAYER_SPEED;
  if (keyIsDown(RIGHT_ARROW)) moveX += PLAYER_SPEED;
  if (keyIsDown(UP_ARROW)) moveY -= PLAYER_SPEED;
  if (keyIsDown(DOWN_ARROW)) moveY += PLAYER_SPEED;

  // WASD support via pressedKeys map (robust across focus/focus issues)
  if (pressedKeys["a"] || pressedKeys["A"]) moveX -= PLAYER_SPEED;
  if (pressedKeys["d"] || pressedKeys["D"]) moveX += PLAYER_SPEED;
  if (pressedKeys["w"] || pressedKeys["W"]) moveY -= PLAYER_SPEED;
  if (pressedKeys["s"] || pressedKeys["S"]) moveY += PLAYER_SPEED;

  movePlayer(moveX, 0);
  movePlayer(0, moveY);
}

function movePlayer(dx, dy) {
  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (
    !collidesWithWalls(nextX, player.y) &&
    !collidesWithDoor(nextX, player.y)
  ) {
    player.x = nextX;
  }

  if (
    !collidesWithWalls(player.x, nextY) &&
    !collidesWithDoor(player.x, nextY)
  ) {
    player.y = nextY;
  }

  player.x = constrain(player.x, player.r, WORLD_W - player.r);
  player.y = constrain(player.y, player.r, WORLD_H - player.r);
}

function collidesWithWalls(cx, cy) {
  // If we have tile map data, use tile-based collision (check tiles overlapped by the player circle)
  if (tileMapData && tileMapData.tiles) {
    // Bounding box for the player's circle
    let left = cx - player.r;
    let right = cx + player.r;
    let top = cy - player.r;
    let bottom = cy + player.r;

    let colLeft = floor(left / TILE_SIZE);
    let colRight = floor(right / TILE_SIZE);
    let rowTop = floor(top / TILE_SIZE);
    let rowBottom = floor(bottom / TILE_SIZE);

    colLeft = constrain(colLeft, 0, mapCols - 1);
    colRight = constrain(colRight, 0, mapCols - 1);
    rowTop = constrain(rowTop, 0, mapRows - 1);
    rowBottom = constrain(rowBottom, 0, mapRows - 1);

    for (let r = rowTop; r <= rowBottom; r++) {
      let line = tileMapData.tiles[r] || "";
      for (let c = colLeft; c <= colRight; c++) {
        let ch = line[c] || ".";
        if (
          ch === "T" ||
          ch === "B" ||
          ch === "L" ||
          ch === "R" ||
          ch === "C" ||
          ch === "N" ||
          ch === "E" ||
          ch === "S" ||
          ch === "W"
        ) {
          // Precise check: ensure circle intersects this tile rect
          let rx = c * TILE_SIZE;
          let ry = r * TILE_SIZE;
          if (
            circleRectCollision(cx, cy, player.r, rx, ry, TILE_SIZE, TILE_SIZE)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Fallback: rectangle list collision
  for (let wall of walls) {
    if (circleRectCollision(cx, cy, player.r, wall.x, wall.y, wall.w, wall.h)) {
      return true;
    }
  }
  return false;
}

function collidesWithDoor(cx, cy) {
  if (door.isOpen) return false;
  return circleRectCollision(cx, cy, player.r, door.x, door.y, door.w, door.h);
}

function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
  // Find closest point on rectangle to circle center
  let closestX = constrain(cx, rx, rx + rw);
  let closestY = constrain(cy, ry, ry + rh);

  // Calculate distance between circle center and closest point
  let dx = cx - closestX;
  let dy = cy - closestY;
  let distSquared = dx * dx + dy * dy;

  // Check if circle intersects (use squared distance to avoid sqrt)
  return distSquared < cr * cr;
}

function checkKeyPickup() {
  if (keyItem.collected) return;

  if (dist(player.x, player.y, keyItem.x, keyItem.y) < player.r + keyItem.r) {
    keyItem.collected = true;
    player.hasKey = true;
    door.isOpen = true;
  }
}

function checkWinCondition() {
  if (!player.hasKey) return;

  if (
    player.x > door.x + door.w &&
    player.y > door.y - player.r &&
    player.y < door.y + door.h + player.r
  ) {
    gameState = "win";
  }
}

function drawRoom() {
  // Draw tiled floor and walls from the tile map if available
  if (tileMapData && tileMapData.tiles) {
    // Draw floor tiles across the whole map
    for (let row = 0; row < mapRows; row++) {
      let line = tileMapData.tiles[row] || "";
      for (let col = 0; col < mapCols; col++) {
        let x = col * TILE_SIZE;
        let y = row * TILE_SIZE;
        // Draw floor
        if (tileFloorImg) image(tileFloorImg, x, y, TILE_SIZE, TILE_SIZE);

        // Draw wall or corner on top if present
        let ch = line[col] || ".";
        let rotationAngle = 0;
        let isWall = false;
        let isCorner = false;

        // Determine tile type and rotation
        // Walls: L (0°), B (90°), R (180°), T (270°)
        // Corners: N (0°), E (90°), S (180°), W (270°)
        if (ch === "L" || ch === "B" || ch === "R" || ch === "T") {
          isWall = true;
          if (ch === "L") rotationAngle = 0;
          else if (ch === "T") rotationAngle = HALF_PI;
          else if (ch === "R") rotationAngle = PI;
          else if (ch === "B") rotationAngle = PI + HALF_PI;
        } else if (ch === "N" || ch === "E" || ch === "S" || ch === "W") {
          isCorner = true;
          if (ch === "N") rotationAngle = 0;
          else if (ch === "E") rotationAngle = HALF_PI;
          else if (ch === "S") rotationAngle = PI;
          else if (ch === "W") rotationAngle = PI + HALF_PI;
        } else if (ch === "C") {
          // Backward compat: C is regular corner (0°)
          isCorner = true;
          rotationAngle = 0;
        }

        // Draw rotated wall or corner
        if (isWall) {
          push();
          translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
          rotate(rotationAngle);
          if (tileWallImg)
            image(
              tileWallImg,
              -TILE_SIZE / 2,
              -TILE_SIZE / 2,
              TILE_SIZE,
              TILE_SIZE,
            );
          else {
            noStroke();
            fill(100, 100, 170);
            rect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
          }
          pop();
        } else if (isCorner) {
          push();
          translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
          rotate(rotationAngle);
          if (tileCornerImg)
            image(
              tileCornerImg,
              -TILE_SIZE / 2,
              -TILE_SIZE / 2,
              TILE_SIZE,
              TILE_SIZE,
            );
          else {
            noStroke();
            fill(140, 120, 200);
            rect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
          }
          pop();
        }
      }
    }
  }
}

function drawKey() {
  if (keyItem.collected) return;
  if (!isInFlashlight(keyItem.x, keyItem.y)) return;

  push();
  translate(keyItem.x, keyItem.y);
  fill(255, 220, 60);
  ellipse(0, 0, keyItem.r * 2.2);
  fill(180, 120, 30);
  rectMode(CENTER);
  rect(0, 0, 10, 18, 3);
  rect(0, -10, 16, 6, 3);
  pop();
}

function drawDoor() {
  push();
  noStroke();
  if (door.isOpen) {
    fill(80, 200, 120);
  } else {
    fill(200, 80, 80);
  }
  rect(door.x, door.y, door.w, door.h, 4);

  if (!door.isOpen) {
    fill(120);
    rect(door.x + 8, door.y + door.h / 2, 8, 36, 4);
  }
  pop();
}

function drawPlayer() {
  imageMode(CENTER);
  push();
  translate(player.x, player.y);
  fill(220);
  stroke(255);
  strokeWeight(2);
  image(playerImg, 0, 0, player.r * 2, player.r * 2);
  pop();
}

function drawFog() {
  push();
  fill(0, 210);
  rect(0, 0, WORLD_W, WORLD_H);

  drawingContext.save();
  drawingContext.globalCompositeOperation = "destination-out";

  let centerX = player.x;
  let centerY = player.y;
  // Convert mouse to world coordinates
  let worldMouseX = mouseX + camera.x;
  let worldMouseY = mouseY + camera.y;
  let targetAngle = atan2(worldMouseY - centerY, worldMouseX - centerX);
  let leftAngle = targetAngle - FLASHLIGHT_ANGLE / 2;
  let rightAngle = targetAngle + FLASHLIGHT_ANGLE / 2;

  // Trace rays to find wall collisions
  let leftCollision = traceRay(centerX, centerY, leftAngle);
  let rightCollision = traceRay(centerX, centerY, rightAngle);

  let leftX = leftCollision.x;
  let leftY = leftCollision.y;
  let rightX = rightCollision.x;
  let rightY = rightCollision.y;

  noStroke();
  fill(255);
  beginShape();
  vertex(centerX, centerY);
  vertex(leftX, leftY);

  // Draw arc of light between left and right rays
  let steps = 12;
  for (let i = 1; i < steps; i++) {
    let t = i / steps;
    let angle = leftAngle + (rightAngle - leftAngle) * t;
    let collision = traceRay(centerX, centerY, angle);
    vertex(collision.x, collision.y);
  }

  vertex(rightX, rightY);
  endShape(CLOSE);

  drawingContext.restore();

  fill(255, 230, 150); //flashlight cone color
  noStroke();
  beginShape();
  vertex(centerX, centerY);
  vertex(leftX, leftY);

  for (let i = 1; i < steps; i++) {
    let t = i / steps;
    let angle = leftAngle + (rightAngle - leftAngle) * t;
    let collision = traceRay(centerX, centerY, angle);
    vertex(collision.x, collision.y);
  }

  vertex(rightX, rightY);
  endShape(CLOSE);
  pop();
}

function traceRay(startX, startY, angle) {
  let rayX = cos(angle);
  let rayY = sin(angle);
  let closestDist = FLASHLIGHT_DISTANCE;

  // Check intersection with all walls
  for (let wall of walls) {
    let hit = rayCircleIntersection(startX, startY, rayX, rayY, wall);
    if (hit && hit.dist < closestDist) {
      closestDist = hit.dist;
    }
  }

  // Check intersection with closed door
  if (!door.isOpen) {
    let hit = rayCircleIntersection(startX, startY, rayX, rayY, door);
    if (hit && hit.dist < closestDist) {
      closestDist = hit.dist;
    }
  }

  return {
    x: startX + rayX * closestDist,
    y: startY + rayY * closestDist,
  };
}

function rayCircleIntersection(startX, startY, dirX, dirY, wall) {
  // AABB-ray intersection (precise)
  let tMin = 0;
  let tMax = FLASHLIGHT_DISTANCE;

  // Check X axis
  if (abs(dirX) > 0.001) {
    let t1 = (wall.x - startX) / dirX;
    let t2 = (wall.x + wall.w - startX) / dirX;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = max(tMin, t1);
    tMax = min(tMax, t2);
  } else {
    // Ray is parallel to X axis
    if (startX < wall.x || startX > wall.x + wall.w) return null;
  }

  // Check Y axis
  if (abs(dirY) > 0.001) {
    let t1 = (wall.y - startY) / dirY;
    let t2 = (wall.y + wall.h - startY) / dirY;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = max(tMin, t1);
    tMax = min(tMax, t2);
  } else {
    // Ray is parallel to Y axis
    if (startY < wall.y || startY > wall.y + wall.h) return null;
  }

  // Check if there's a valid intersection
  if (tMin <= tMax && tMin > 0.1) {
    return { dist: tMin };
  }

  return null;
}

function isInFlashlight(x, y) {
  let centerX = player.x;
  let centerY = player.y;
  // Convert mouse to world coordinates
  let worldMouseX = mouseX + camera.x;
  let worldMouseY = mouseY + camera.y;
  let targetAngle = atan2(worldMouseY - centerY, worldMouseX - centerX);
  let pointAngle = atan2(y - centerY, x - centerX);
  let angleDiff = abs(angleDifference(pointAngle, targetAngle));
  let distance = dist(centerX, centerY, x, y);

  if (distance >= FLASHLIGHT_DISTANCE || angleDiff >= FLASHLIGHT_ANGLE / 2) {
    return false;
  }

  // Check if there's a wall between player and point
  for (let wall of walls) {
    if (isLineRectIntersecting(centerX, centerY, x, y, wall)) {
      return false;
    }
  }

  // Check if closed door blocks the light
  if (!door.isOpen && isLineRectIntersecting(centerX, centerY, x, y, door)) {
    return false;
  }

  return true;
}

function isLineRectIntersecting(x1, y1, x2, y2, wall) {
  // Check if line segment from (x1,y1) to (x2,y2) intersects rectangle
  // Check all four edges of the rectangle

  // Top edge
  if (lineIntersect(x1, y1, x2, y2, wall.x, wall.y, wall.x + wall.w, wall.y))
    return true;
  // Bottom edge
  if (
    lineIntersect(
      x1,
      y1,
      x2,
      y2,
      wall.x,
      wall.y + wall.h,
      wall.x + wall.w,
      wall.y + wall.h,
    )
  )
    return true;
  // Left edge
  if (lineIntersect(x1, y1, x2, y2, wall.x, wall.y, wall.x, wall.y + wall.h))
    return true;
  // Right edge
  if (
    lineIntersect(
      x1,
      y1,
      x2,
      y2,
      wall.x + wall.w,
      wall.y,
      wall.x + wall.w,
      wall.y + wall.h,
    )
  )
    return true;

  // Check if start or end point is inside the rectangle
  if (
    x1 >= wall.x &&
    x1 <= wall.x + wall.w &&
    y1 >= wall.y &&
    y1 <= wall.y + wall.h
  )
    return true;
  if (
    x2 >= wall.x &&
    x2 <= wall.x + wall.w &&
    y2 >= wall.y &&
    y2 <= wall.y + wall.h
  )
    return true;

  return false;
}

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  // Check if line segment (x1,y1)-(x2,y2) intersects with line segment (x3,y3)-(x4,y4)
  let denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (abs(denom) < 0.0001) return false; // Parallel or coincident

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function angleDifference(a, b) {
  let diff = a - b;
  while (diff < -PI) diff += TWO_PI;
  while (diff > PI) diff -= TWO_PI;
  return diff;
}

function drawUI() {
  noStroke();
  fill(240);
  textSize(16);
  textAlign(LEFT);
  text("Move: WASD / Arrow keys", 18, 28);
  text("Look: Mouse cursor", 18, 50);
  text("Collect the key and escape through the door.", 18, 72);

  textAlign(RIGHT);
  if (player.hasKey) {
    fill(120, 220, 120);
    text("Key: Obtained", width - 18, 28);
  } else {
    fill(220, 120, 120);
    text("Key: Missing", width - 18, 28);
  }

  fill(255, 200);
  textAlign(CENTER);
  textSize(14);
  if (!player.hasKey) {
    text(
      "The locked door glows red until you find the key.",
      width / 2,
      height - 24,
    );
  } else {
    text(
      "The door is unlocked. Move through the green opening to escape.",
      width / 2,
      height - 24,
    );
  }
}

function drawWinScreen() {
  push();
  fill(0, 200);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER);
  textSize(52);
  text("You Escaped!", width / 2, height / 2 - 20);
  textSize(20);
  text("Press R to restart", width / 2, height / 2 + 30);
  pop();
}

function keyPressed() {
  // Track pressed key for WASD support
  if (key && key.length === 1) pressedKeys[key] = true;

  if ((key === "r" || key === "R") && gameState === "win") {
    initGame();
  }
}

function keyReleased() {
  if (key && key.length === 1) pressedKeys[key] = false;
}
