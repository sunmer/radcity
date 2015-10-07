var canvasHeight = 600;
var canvasWidth = 600;

var gameSettings = { movementSpeed: 3, backgroundSpeed: 2 };
var assetPlayer = { res: 'assets/player_sprite.png', anim: 'playerAnim', scale: { x: .5, y: .5 }, key: 'player' };
var assetEnemy = { res: 'assets/enemy_sprite.png', anim: 'enemyAnim', scale: { x: 0.5, y: 0.5 }, key: 'enemy' };
var assetLevel = { res: 'assets/bg_level.png', anim: 'level1Anim', scale: { x: 1, y: 1 }, key: 'level1' };

var states = {
    player: undefined,
    enemies: [],
    level: undefined,

    preload: function() {
        game.load.spritesheet(assetPlayer.key, assetPlayer.res, 212, 104, 2);
        game.load.spritesheet(assetEnemy.key, assetEnemy.res, 212, 104, 2);
        game.load.image(assetLevel.key, assetLevel.res);
    },

    create: function() {
        this.level = game.add.tileSprite(0, 0, game.stage.getBounds().width, game.cache.getImage(assetLevel.key).height, assetLevel.key);
        
        this.player = game.add.sprite(game.world.centerX, game.world.centerY, assetPlayer.key);
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.anchor.set(0.5);
        this.player.scale.setTo(assetPlayer.scale.x, assetPlayer.scale.y);
        this.player.animations.add(assetPlayer.anim);
        this.player.animations.play(assetPlayer.anim, 10, true);

        this.generateEnemy();
    },

    update: function() {
        this.level.tilePosition.x -= gameSettings.backgroundSpeed;

        if(game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            console.log(this.player.y);
            console.log(game.stage.getBounds().height / 2)
            if(this.player.y > (game.stage.getBounds().height / 2)) {
                this.player.y -= gameSettings.movementSpeed;
            }
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.player.y += gameSettings.movementSpeed;
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            this.player.x -= gameSettings.movementSpeed;
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.x += gameSettings.movementSpeed;
        }

        for(var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];
            enemy.x -= gameSettings.movementSpeed;

            if(enemy.x < 0) {
                enemy.kill();
                this.enemies.splice(i, 1);
                this.generateEnemy();
            }

            if(this.checkOverlap(this.player, enemy)) {
                this.gameOver();
            }
        }
    },

    generateEnemy: function() {
        var minY = game.stage.getBounds().height / 2;
        var maxY = game.stage.getBounds().width;

        var enemy = game.add.sprite(game.stage.getBounds().width, Math.random() * (maxY - minY) + minY, assetEnemy.key);
        enemy.scale.setTo(assetEnemy.scale.x, assetEnemy.scale.y);

        var enemyAnim = enemy.animations.add(assetEnemy.anim);
        enemy.animations.play(assetEnemy.anim, 10, true);
        enemy.outOfBoundsKill = true;

        this.enemies.push(enemy);
    },

    destroyEnemy: function(enemy) {

    },

    checkOverlap: function(spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    gameOver: function() {
        this.player.kill();
    },

    render: function() {
        game.debug.inputInfo(16, 16);
    } 
}

var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.AUTO, 'canvas', states);

