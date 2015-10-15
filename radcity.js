var canvasHeight = 600;
var canvasWidth = 600;

var gameSettings = { backgroundSpeed: 3, difficulty: 4, minLengthBetweenEnemies: 200 };

var assets = {
    player: {
        dimensions: { width: 235, height: 300 },
        projectile: {
            res: 'assets/projectile.png',
            key: 'projectile',
            scale: { x: 0.3, y: 0.3 },
            speed: 200
        },
        animations: {
            movement: {
                res: 'assets/player_dogi.png',
                key: 'player',
                scale: { x: 0.2, y: 0.2 },
                speed: 3
            },
            projectile: {
                res: 'assets/player_dogi_projectile.png',
                key: 'playerProjectile',
                scale: { x: 0.2, y: 0.2 }
            },
            gameOver: {
                res: 'assets/player_dogi_gameover.png',
                key: 'playerGameOver',
                scale: { x: 0.2, y: 0.2 }
            }
        }
    },
    enemies: {
        nova: {
            dimensions: { width: 140, height: 300 },
            animations: {
                movement: { 
                    res: 'assets/enemy_jake.png',
                    key: 'enemyJake',
                    scale: { x: 0.2, y: 0.2 },
                    speed: 200
                },
                killed: {
                    res: 'assets/enemy_jake_killed.png',
                    key: 'enemyJakeKilled',
                    dimensions: { width: 140, height: 300 }
                }
            }
        },
        jake: {
            dimensions: { width: 140, height: 300 },
            animations: {
                movement: { 
                    res: 'assets/enemy_nova.png',
                    key: 'enemyNova',
                    scale: { x: 0.2, y: 0.2 },
                    speed: 200,
                },
                killed: {
                    res: 'assets/enemy_nova_killed.png',
                    key: 'enemyNovaKilled'
                }
            }
        }
    },
    level: { res: 'assets/bg_level.png', anim: 'level1Anim', scale: { x: 1, y: 1 }, key: 'level1' },
    font: { name: 'carrierCommand', resPNG: 'assets/fonts/carrier_command.png', resXML: 'assets/fonts/carrier_command.xml' }
}

var states = {

    //Player
    player: undefined,

    //Enemies currently in screen
    enemies: [],

    //Bullets currently in screen
    projectiles: [],

    //Current level
    level: undefined,

    //Determines if player has lost
    isGameOver: false,

    //Player is moving
    isPlayerMoving: false,

    textScore: {
        label: 'score',
        value: 0,
        viewLabel: undefined,
        viewValue: undefined,
        fontSize: 20
    },

    preload: function() {
        //Non-animated assets
        game.load.image(assets.level.key, assets.level.res);
        game.load.image(assets.player.projectile.key, assets.player.projectile.res);

        //Player sprites and animations
        game.load.spritesheet(assets.player.animations.movement.key, assets.player.animations.movement.res, assets.player.dimensions.width, assets.player.dimensions.height, 4);
        game.load.spritesheet(assets.player.animations.gameOver.key, assets.player.animations.gameOver.res, assets.player.dimensions.width, assets.player.dimensions.height, 4);
        game.load.spritesheet(assets.player.animations.projectile.key, assets.player.animations.projectile.res, assets.player.dimensions.width, assets.player.dimensions.height, 1);

        //Enemy sprites and animations
        game.load.spritesheet(assets.enemies.nova.animations.movement.key, assets.enemies.nova.animations.movement.res, assets.enemies.nova.dimensions.width, assets.enemies.nova.dimensions.height, 4);
        game.load.spritesheet(assets.enemies.nova.animations.killed.key, assets.enemies.nova.animations.killed.res, assets.enemies.nova.dimensions.width, assets.enemies.nova.dimensions.height, 4);
        game.load.spritesheet(assets.enemies.jake.animations.movement.key, assets.enemies.jake.animations.movement.res, assets.enemies.jake.dimensions.width, assets.enemies.jake.dimensions.height, 4);
        game.load.spritesheet(assets.enemies.jake.animations.killed.key, assets.enemies.jake.animations.killed.res, assets.enemies.jake.dimensions.width, assets.enemies.jake.dimensions.height, 4);

        game.load.bitmapFont(assets.font.name, assets.font.resPNG, assets.font.resXML);
    },

    create: function() {
        //Assets
        this.level = game.add.tileSprite(0, 0, canvasWidth, game.cache.getImage(assets.level.key).height, assets.level.key);
        
        this.player = game.add.sprite(game.world.centerX, game.world.centerY, assets.player.animations.movement.key);
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.anchor.set(0.5);
        this.player.scale.setTo(assets.player.animations.movement.scale.x, assets.player.animations.movement.scale.y);

        this.player.animations.add(assets.player.animations.movement.key);
        this.player.animations.add(assets.player.animations.gameOver.key);

        //Listeners
        game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.generateProjectile, this);

        this.generateEnemy(gameSettings.difficulty);

        this.textScore.viewLabel = game.add.bitmapText(0, canvasHeight - 20, assets.font.name, this.textScore.label, 20);
        this.textScore.viewLabel.align = 'center';
        this.textScore.viewValue = game.add.bitmapText(this.textScore.viewLabel.width + 10, canvasHeight - 20, assets.font.name, this.textScore.value, 20);
        this.textScore.viewValue.align = 'right';
    },

    update: function() {
        if(!this.isGameOver) {
            if(game.input.keyboard.isDown(Phaser.Keyboard.W)) {
                if(this.player.body.y > (canvasHeight / 2)) {
                    this.player.body.y -= assets.player.animations.movement.speed;
                }

                this.isPlayerMoving = true;
            }
            if(game.input.keyboard.isDown(Phaser.Keyboard.S)) {
                this.player.body.y += assets.player.animations.movement.speed;
                this.isPlayerMoving = true;
            }
            if(game.input.keyboard.isDown(Phaser.Keyboard.A)) {
                this.player.body.x -= assets.player.animations.movement.speed;
                this.isPlayerMoving = true;
            }
            if(game.input.keyboard.isDown(Phaser.Keyboard.D)) {
                if(this.player.body.x >= (canvasWidth / 3)) {
                    this.level.tilePosition.x -= gameSettings.backgroundSpeed;
                } else {
                    this.player.body.x += assets.player.animations.movement.speed;
                }

                this.isPlayerMoving = true;
            }

            if(this.isPlayerMoving) {
                this.player.animations.play(assets.player.animations.movement.key, 10);
            } else {
                this.player.animations.stop(null, true);
            }

            this.isPlayerMoving = false;

            if(this.enemies.length) {
                for(var i = 0; i < this.enemies.length; i++) {
                    var enemy = this.enemies[i];

                    if(enemy.x < 0) {
                        this.enemies.splice(i, 1);
                        enemy.destroy();
                    } else {
                        if(this.checkOverlap(this.player, enemy)) {
                            this.gameOver();
                        }

                        for(var y = 0; y < this.projectiles.length; y++) {
                            if(this.checkOverlap(this.projectiles[y], enemy) && enemy._isAlive) {
                                this.killEnemy.call(this, enemy);
                                this.projectiles[y].destroy();
                                this.projectiles.splice(y, 1);
                            }
                        }
                    }
                }
            } else if(this.enemies.length < gameSettings.difficulty) {
                this.generateEnemy(gameSettings.difficulty);
            }
            
        }    
    },

    generateEnemy: function(numberOfEnemies) {
        var minY = game.cache.getImage(assets.level.key).height;
        var maxY = canvasHeight;
        var enemy, enemyAsset;

        for(var i = 0; i < numberOfEnemies; i++) {
            enemyAsset = assets.enemies[Object.keys(assets.enemies)[Math.round(Math.random() * (Object.keys(assets.enemies).length - 1))]];

            enemy = game.add.sprite(
                canvasWidth + (Math.random() * gameSettings.minLengthBetweenEnemies),
                Math.floor(Math.random() * ( maxY - minY) + minY),
                enemyAsset.animations.movement.key
            );

            game.physics.enable(enemy, Phaser.Physics.ARCADE);
            enemy.anchor.set(0.5);
            enemy.scale.setTo(enemyAsset.animations.movement.scale.x, enemyAsset.animations.movement.scale.y);
            enemy.animations.add(enemyAsset.animations.movement.key);
            enemy.animations.play(enemyAsset.animations.movement.key, 10, true);
            enemy.body.velocity.x -= enemyAsset.animations.movement.speed;
            enemy.enemyAsset = enemyAsset;

            //For enemy lookup
            enemy._spriteID = this.generateSpriteID();

            //Separate alive state mechanism, outside of Phaser's which affect animations
            enemy._isAlive = true;

            this.enemies.push(enemy);
        }
    },

    generateProjectile: function() {
        if(!this.isGameOver) {
            this.player.loadTexture(assets.player.animations.projectile.key, 0);
            this.player.animations.play(assets.player.animations.projectile.key, 10);

            setTimeout(function() {
                this.player.loadTexture(assets.player.animations.movement.key, 0);
                this.player.animations.play(assets.player.animations.movement.key, 10);
            }.bind(this), 250);

            if(this.projectiles.length > 2) {
                this.projectiles[0].destroy();
                this.projectiles.splice(0, 1);
            } else {
                var projectile = game.add.sprite(this.player.x + 15, this.player.y, assets.player.projectile.key);
                game.physics.enable(projectile, Phaser.Physics.ARCADE);
                projectile.anchor.set(0.5);
                projectile.scale.setTo(assets.player.projectile.scale.x, assets.player.projectile.scale.y);
                projectile.body.velocity.x += assets.player.projectile.speed;

                this.projectiles.push(projectile);
            }
        }
    },

    killEnemy: function(enemy) {
        this.increaseScore(5);

        enemy._isAlive = false;
        enemy.loadTexture(enemy.enemyAsset.animations.killed.key, 0);
        enemy.animations.add(enemy.enemyAsset.animations.killed.key);
        enemy.animations.play(enemy.enemyAsset.animations.killed.key, 10);
        enemy.body.velocity.x = 0;

        setTimeout(function() {
            var elementPos = this.enemies.map(function(enemy) {
                return enemy._spriteID; 
            }).indexOf(enemy._spriteID);

            this.enemies.splice(elementPos, 1);
            enemy.destroy();
        }.bind(this), 500);
    },

    checkOverlap: function(spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    gameOver: function() {
        this.player.loadTexture(assets.player.animations.gameOver.key, 0);
        this.player.animations.play(assets.player.animations.gameOver.key, 10, true);

        for(var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].animations.stop(null, true);
        }

        this.isGameOver = true;
    },

    generateSpriteID: function() {
        return Math.round(Math.random() * 10000);
    },

    increaseScore: function(value) {
        this.textScore.viewValue.setText(this.textScore.value += value);
    },

    render: function() {
        game.debug.inputInfo(16, 16);
    } 
}

var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.CANVAS, 'canvas', states);