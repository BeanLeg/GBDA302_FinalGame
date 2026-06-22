const CANVAS_W = 800;
const CANVAS_H = 600;
const WORLD_W = 2000;
const WORLD_H = 1600;
const PLAYER_SPEED = 3.2;
const PLAYER_RADIUS = 10;
const FLASHLIGHT_DISTANCE = 360;
const FLASHLIGHT_ANGLE = Math.PI / 3;
const CAM_SMOOTHING = 0.08;

let player;
let camera;
let walls = [];
let keyItem;
let door;
let gameState;

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  textFont("monospace");
  camera = { x: 0, y: 0 };
  initGame();
}

function initGame() {
  player = {
    x: 200,
    y: 200,
    r: PLAYER_RADIUS,
    hasKey: false,
  };

  walls = [
    // Outer boundary
    { x: 0, y: 0, w: WORLD_W, h: 30 },
    { x: 0, y: WORLD_H - 30, w: WORLD_W, h: 30 },
    { x: 0, y: 0, w: 30, h: WORLD_H },
    { x: WORLD_W - 30, y: 0, w: 30, h: WORLD_H / 2 - 100 },
    { x: WORLD_W - 30, y: WORLD_H / 2 + 100, w: 30, h: WORLD_H },

    // Main corridor horizontal
    { x: 0, y: 300, w: 600, h: 30 },
    { x: 800, y: 300, w: WORLD_W - 800, h: 30 },

    // Main corridor vertical sections
    { x: 300, y: 100, w: 30, h: 300 },
    { x: 800, y: 100, w: 30, h: 400 },
    { x: 1400, y: 200, w: 30, h: 600 },

    // Room 1 - left side
    { x: 100, y: 450, w: 400, h: 30 },
    { x: 100, y: 450, w: 30, h: 300 },
    { x: 470, y: 450, w: 30, h: 300 },

    // Room 2 - middle section
    { x: 600, y: 500, w: 300, h: 30 },
    { x: 600, y: 500, w: 30, h: 250 },
    { x: 870, y: 500, w: 30, h: 250 },

    // Room 3 - right side with door
    { x: 1100, y: 400, w: 450, h: 30 },
    { x: 1100, y: 400, w: 30, h: 350 },
    { x: 1520, y: 550, w: 30, h: 200 },

    // Additional maze walls
    { x: 700, y: 150, w: 200, h: 30 },
    { x: 900, y: 700, w: 400, h: 30 },
    { x: 1300, y: 900, w: 350, h: 30 },
    { x: 400, y: 900, w: 500, h: 30 },
    { x: 200, y: 1100, w: 600, h: 30 },
  ];

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
  //text(player.x + ", " + player.y, player.x, player.y - 20);

  pop();

  drawUI();

  if (gameState === "win") {
    drawWinScreen();
  }
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

  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) moveX -= PLAYER_SPEED;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) moveX += PLAYER_SPEED;
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) moveY -= PLAYER_SPEED;
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) moveY += PLAYER_SPEED;

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
  noStroke();
  fill(35);
  rect(0, 0, WORLD_W, WORLD_H);

  fill(45);
  rect(15, 15, WORLD_W - 30, WORLD_H - 30, 12);

  // Draw walls
  fill(100, 100, 170);
  for (let wall of walls) {
    rect(wall.x, wall.y, wall.w, wall.h, 4);
  }

  /* Draw visible border around room
  stroke(80, 70, 100);
  strokeWeight(3);
  noFill();
  rect(15, 15, WORLD_W - 30, WORLD_H - 30, 12);
  */
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
  push();
  translate(player.x, player.y);
  fill(220);
  stroke(255);
  strokeWeight(2);
  ellipse(0, 0, player.r * 2);
  noStroke();
  fill(110, 220, 255);
  ellipse(0, 0, player.r * 1.2);
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

  fill(255, 230, 150, 100);
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
  if ((key === "r" || key === "R") && gameState === "win") {
    initGame();
  }
}
