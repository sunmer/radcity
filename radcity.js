var canvasHeight = 600;
var canvasWidth = 600;

var gameSettings = { movementSpeed: 3, backgroundSpeed: 3, difficulty: 2, distanceBetweenEnemies: 200 };

var assets = {
    player: { res: 'assets/player_dogi.png', anim: 'playerAnim', animGameOver: 'playerAnimGameOver', key: 'player', scale: { x: 0.2, y: 0.2 } },
    enemies: [
        { res: 'assets/enemy_jake.png', anim: 'enemyJakeAnim', key: 'enemyJake', scale: { x: 0.2, y: 0.2 } },
        { res: 'assets/enemy_nova.png', anim: 'enemyNovaAnim', key: 'enemyNova', scale: { x: 0.2, y: 0.2 } }
    ],
    level: { res: 'assets/bg_level.png', anim: 'level1Anim', scale: { x: 1, y: 1 }, key: 'level1' }
}

var states = {
    player: undefined,
    enemies: [],
    projectiles: [],
    level: undefined,
    isGameOver: false,
    isPlayerMoving: false,

    preload: function() {
        game.load.spritesheet(assets.player.key, assets.player.res, 140, 300, 4);

        for(i = 0; i < assets.enemies.length; i++) {
            game.load.spritesheet(assets.enemies[i].key, assets.enemies[i].res, 140, 300, 4);    
        }
        
        game.load.image(assets.level.key, assets.level.res);

        game.load.spritesheet(assets.player.animGameOver, 'assets/player_dogi_gameover.png', 140, 300, 4);
    },

    create: function() {
        this.level = game.add.tileSprite(0, 0, canvasWidth, game.cache.getImage(assets.level.key).height, assets.level.key);
        
        this.player = game.add.sprite(game.world.centerX, game.world.centerY, assets.player.key);
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.anchor.set(0.5);
        this.player.scale.setTo(assets.player.scale.x, assets.player.scale.y);
        this.player.animations.add(assets.player.anim)

        this.generateEnemy(gameSettings.difficulty);
    },

    update: function() {
        if(!this.isGameOver) {
            if(game.input.keyboard.isDown(Phaser.Keyboard.W)) {
                if(this.player.y > (canvasHeight / 2)) {
                    this.player.y -= gameSettings.movementSpeed;
                }

                this.isPlayerMoving = true;
            }
            if(game.input.keyboard.isDown(Phaser.Keyboard.S)) {
                this.player.y += gameSettings.movementSpeed;
                this.isPlayerMoving = true;
            }
            if(game.input.keyboard.isDown(Phaser.Keyboard.A)) {
                this.player.x -= gameSettings.movementSpeed;
                this.isPlayerMoving = true;
            }
            if(game.input.keyboard.isDown(Phaser.Keyboard.D)) {
                if(this.player.x >= (game.stage.getBounds().width / 3)) {
                    this.level.tilePosition.x -= gameSettings.backgroundSpeed;
                } else {
                    this.player.x += gameSettings.movementSpeed;
                }

                this.isPlayerMoving = true;
            }

            if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                console.log("shoot");
            }

            if(this.isPlayerMoving) {
                this.player.animations.play(assets.player.anim, 10, true);
            } else {
                this.player.animations.stop(null, true);
            }

            this.isPlayerMoving = false;

            for(var i = 0; i < this.enemies.length; i++) {
                var enemy = this.enemies[i];
                enemy.x -= gameSettings.movementSpeed;

                if(enemy.x < 0) {
                    this.enemies.splice(i, 1);
                    enemy.destroy();
                    
                    if(this.enemies.length == 0) {
                        this.generateEnemy(gameSettings.difficulty);
                    }
                } else {
                    if(this.checkOverlap(this.player, enemy)) {
                        this.gameOver();
                    }    
                }
            }
        }    
    },

    generateEnemy: function(numberOfEnemies) {
        var minY = canvasHeight / 2;
        var maxY = game.stage.getBounds().width;
        var enemy, enemyAnim, enemyType;

        for(var i = 0; i < numberOfEnemies; i++) {
            enemyType = Math.round(Math.random() * 1);

            enemy = game.add.sprite(
                game.stage.getBounds().width + (Math.random() * gameSettings.distanceBetweenEnemies), 
                Math.random() * (maxY - minY) + minY, 
                assets.enemies[enemyType].key);

            enemy.scale.setTo(assets.enemies[enemyType].scale.x, assets.enemies[enemyType].scale.y);

            enemyAnim = enemy.animations.add(assets.enemies[enemyType].anim);
            enemy.animations.play(assets.enemies[enemyType].anim, 10, true);

            enemy.outOfBoundsKill = true;

            this.enemies.push(enemy);
        }
    },

    generateProjectile: function() {

    },

    destroyEnemy: function(enemy) {

    },

    checkOverlap: function(spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    gameOver: function() {
        this.player.loadTexture(assets.player.animGameOver, 0);
        this.player.animations.add('gameOverAnim');
        this.player.animations.play('gameOverAnim', 10, true);

        for(var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].animations.stop(null, true);
        }

        this.isGameOver = true;
    },

    render: function() {
        game.debug.inputInfo(16, 16);
    } 
}

var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.CANVAS, 'canvas', states);

