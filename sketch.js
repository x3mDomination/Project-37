var trex, trex_running0, trex_running1, trexrunning2, trex_collided;
var trexAnimation = 0;
var ground, invisibleGround, groundImage;
var textPosition = 500;
var cloudsGroup, cloudImage;
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4, obstacle5, obstacle6;
var gameState,PLAY,END;
var score;
var gameOverImage,gameOver,restartButton,restart;
var database, highScoreRef, globalHighScore;
localStorage["high score"] = 0;

function preload(){
  trex_running0 = loadImage("images/trex_0.png");
  trex_running1 = loadImage("images/trex_1.png");
  trex_running2 = loadImage("images/trex_2.png");

  trex_collided = loadImage("images/trex_collided0.png");
  
  groundImage = loadImage("images/ground0.png");
  
  cloudImage = loadImage("images/cloud0.png");
  
  obstacle1 = loadImage("images/obstacle10.png");
  obstacle2 = loadImage("images/obstacle20.png");
  obstacle3 = loadImage("images/obstacle30.png");
  obstacle4 = loadImage("images/obstacle40.png");
  obstacle5 = loadImage("images/obstacle50.png");
  obstacle6 = loadImage("images/obstacle60.png");
  
  gameOverImage = loadImage("images/gameOver0.png");
  restartButton = loadImage("images/restart0.png");
}

function setup() {
  createCanvas(600, 200);

  database = firebase.database();
  getHighScore();
  
  PLAY = 1;
  END = 0;
  gameState = PLAY;
  
  gameOver = createSprite(300,75,10,10);
  gameOver.addImage("text",gameOverImage);
  gameOver.scale = 2;
  gameOver.visible=false;
  
  restart = createSprite(300,150,10,10);
  restart.addImage("button",restartButton);
  restart.scale = 0.5;
  restart.visible=false;
  
  trex = createSprite(50,180,20,50);
  trex.addImage("running0", trex_running0);
  trex.addImage("running1", trex_running1);
  trex.addImage("running2", trex_running2);
  trex.addImage("collide",trex_collided);
  trex.scale = 0.5;
  trex.setCollider("circle",0,0,30);
  
  ground = createSprite(200,180,400,20);
  ground.addImage("ground",groundImage);
  ground.x = ground.width /2;
  
  invisibleGround = createSprite(200,180,400,10);
  invisibleGround.visible = false;
  
  cloudsGroup = new Group();
  obstaclesGroup = new Group();
  
  score = 0;
}

function draw() {
  if(Math.ceil(score/300)%2 === 0 && camera.x > 312){
    background(40);
  }
  else {
    background(200)
  }

  //trex.debug = true;
  //console.log(camera.x);

  text("Score: "+ score, textPosition,50);
  text("HI: " + localStorage["high score"],textPosition,75);
  text("Global HI: "+globalHighScore,textPosition, 100);
  
  if(gameState === PLAY) {
    score = score + Math.round(getFrameRate()/60);

    if(trexAnimation===0){
      trex.changeImage("running0", trex_running0);
      trexAnimation++;
    }
    else if(trexAnimation===1){
      trex.changeImage("running1", trex_running1);
      trexAnimation++;
    }
    else {
      trex.changeImage("running2", trex_running2);
      trexAnimation = 0;
    }
    
    //console.log(trex.y);
    
    //moves all sprites, text, and the camera forward
    ground.x += (4 + score/100);
    invisibleGround.x += (4 + score/100);
    trex.x += (4 + score/100);
    camera.x += (4 + score/100);
    textPosition += (4 + score/100);
    
    if(keyDown("space") && trex.y>151) {
      trex.velocityY = -13;
    }

    trex.velocityY = trex.velocityY + 0.8
    /*
    if (ground.x < 0){
      ground.x = ground.width/2;
    }
    */
    
    spawnClouds();
    spawnObstacles();
    
    if(trex.isTouching(obstaclesGroup)) {
      gameState=END;
    }
  }
  
  else if(gameState === END) {
    gameOver.x = camera.x;
    restart.x = camera.x;
    
    ground.velocityX = 0;
    obstaclesGroup.setLifetimeEach(-1);
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setLifetimeEach(-1);
    cloudsGroup.setVelocityXEach(0);

    gameOver.visible = true;
    restart.visible = true;
    
    trex.velocityY = 0;
    trex.changeImage("collide",trex_collided);
    
    if(mousePressedOver(restart)) {
      reset();
    }
  }
  
  trex.collide(invisibleGround);
  
  drawSprites();
}

function spawnClouds() {
  //write code here to spawn the clouds
  if (Math.ceil(camera.x) % 200 > 0 && Math.ceil(camera.x) % 200 < 3) {
    var cloud = createSprite(camera.x+300,120,40,10);
    cloud.y = Math.round(random(80,120));
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    //cloud.velocityX = -3;
    
     //assign lifetime to the variable
    cloud.lifetime = 200;
    
    //adjust the depth
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //add each cloud to the group
    cloudsGroup.add(cloud);
  }
  
}

function spawnObstacles() {
  if(Math.ceil(camera.x) % 150 > 0 && Math.ceil(camera.x) % 150 < 3) {
    var obstacle = createSprite(camera.x+300,165,10,40);
    //obstacle.velocityX = -(4 + score*3/100);
    
    //generate random obstacles
    var rand = Math.round(random(1,6));
    //console.log(rand);
    switch(rand) {
      case 1: obstacle.addImage(obstacle1);
              //obstacle1.scale = 0.5;
              break;
      case 2: obstacle.addImage(obstacle2);
              break;
      case 3: obstacle.addImage(obstacle3);
              break;
      case 4: obstacle.addImage(obstacle4);
              //obstacle4.scale = 0.1;
              break;
      case 5: obstacle.addImage(obstacle5);
              break;
      case 6: obstacle.addImage(obstacle6);
              break;
      default: break;
    }
    
    //assign scale and lifetime to the obstacle           
    obstacle.scale = 0.5;
    obstacle.lifetime = 300;
    //add each obstacle to the group
    obstaclesGroup.add(obstacle);
  }
}

function reset() {
   gameState = PLAY;
   gameOver.visible=false;
   restart.visible=false;
  
   //trex.changeImage("running",trex_running);
  
   obstaclesGroup.destroyEach();
   cloudsGroup.destroyEach();
  
  if(localStorage["high score"]<score) {
    localStorage["high score"] = score;
  }

  if(globalHighScore<score){
    updateHighScore(score);
    getHighScore();
  }
  
  score = 0;
}

function getHighScore(){
  highScoreRef = database.ref('highScore');
  highScoreRef.on("value",function(data){
    globalHighScore = data.val();
  })
}

function updateHighScore(score){
  database.ref('/').update({
    highScore: score
  })
}