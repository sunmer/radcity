var canvasHeight = 600;
var canvasWidth = 600;

var assetPlayer = { res: 'assets/player_sprite.png', anim: 'playerAnim', scale: { x: .5, y: .5 }, key: 'player' };
var assetEnemy = { res: 'assets/enemy_sprite.png', anim: 'enemyAnim', scale: { x: 0.5, y: 0.5 }, key: 'enemy' };
var assetLevel = { res: 'assets/bg_level.png', anim: 'level1Anim', scale: { x: 1, y: 1 }, key: 'level1' };

var states = {
    player: undefined,
    playerAnim: undefined,
    enemy: undefined,
    enemyAnim: undefined,
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
        this.playerAnim = this.player.animations.add(assetPlayer.anim);
        this.player.animations.play(assetPlayer.anim, 10, true);

        this.enemy = game.add.sprite(-100, -100, assetEnemy.key);
        this.enemy.scale.setTo(assetEnemy.scale.x, assetEnemy.scale.y);
        this.enemyAnim = this.enemy.animations.add(assetEnemy.anim);
        this.enemy.animations.play(assetEnemy.anim, 10, true);
    },

    update: function() {
        this.level.tilePosition.x -= 1;

        if(game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            if(this.player.y > (game.stage.getBounds().height / 2)) {
                this.player.y -= 2;
            }
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.player.y += 2;
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            this.player.x -= 2;
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.x += 2;
        }

        if(this.enemy.x < 0) {
            this.generateEnemy();
        } else {
            this.enemy.x -= 2;
        }

        if(this.checkOverlap(this.player, this.enemy)) {
            this.gameOver();
        }
    },

    generateEnemy: function() {
        var minY = game.stage.getBounds().height / 2;
        var maxY = game.stage.getBounds().height - this.enemy.getBounds().height;

        this.enemy.x = game.stage.getBounds().width;
        this.enemy.y = Math.random() * (maxY - minY) + minY;
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

