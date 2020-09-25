class MatchScene extends Phaser.Scene
{

    constructor (config)
    {
        super(config);
    }

    initVariables()
    {
        this.loadingPercentage;
        this.loadingText;
        this.loadingShadow;
        this.background;
        this.timeToWait = 0;
        this.waitingForMatch = false;
        this.socket;
        this.players = {};
        this.spawnables = [];
        this.spawnablesSprites = [];
        this.obstacles = [];
        this.playerHitboxes = [];
        this.focusedPlayer = null;
        this.focusedPlayerId = -1;
        this.background;
        this.tileResourceFailed = false;
        this.enemyBullets;
        this.playerBullets;
        this.smokeEmitter;
        this.bloodEmitter;
        this.hints = {};
        this.healthEmitter;
        this.reloadAnimEmitter;
    }

    create(data)
    {
        if(data.socket && data.timeToWait)
        {
            this.initVariables();
            this.socket = data.socket;

            this.loadingShadow = this.add.rectangle(0, 0, 1920, 1080, "0x000000", 0.6).setOrigin(0, 0);
            this.loadingShadow.alpha = 0;

            this.timeToWait = data.timeToWait;

            this.background = this.add.image(0, 0, 'loginbg').setOrigin(0, 0);

            this.loadingShadow.alpha = 1;
            this.children.bringToTop(this.loadingShadow);

            this.loadingText = this.add.sprite(960, 550, 'connectingAnim', 'connectingAnim0001.png');
            this.children.bringToTop(this.loadingText);

            this.loadingText.anims.play('connectingAnimation');

            this.loadingPercentage = this.add.text(960, 790, "Match starting in " + Math.ceil(this.timeToWait / 1000) + "...", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'}).setOrigin(0, 0);
            this.centerInContainer(this.background, this.loadingPercentage);
            this.children.bringToTop(this.loadingPercentage);

            data.socket.emit("matchExt", "matchOk");

            if(data.createMatchExtListener)
            {
                data.socket.on('matchExt', (responseType, args) => {
                    this.handleWorldResponse(data.socket, responseType, args);
                });
            }

            this.waitingForMatch = true;

            this.initiateControls(data.socket);
        }
    }

    initiateControls(socket)
    {
        this.input.keyboard.on('keydown', (event) => {
            if(this.focusedPlayer)
            {
                switch(event.which)
                {
                    case 87:
                        socket.emit("matchExt", "movePlayer", ["plus"]);
                        break;
                    case 83:
                        socket.emit("matchExt", "movePlayer", ["minus"]);
                        break;
                }
            }
        });

        this.input.keyboard.on('keyup', (event) => {
            switch(event.which)
            {
                case 27:
                    game.scene.getScene("UIScene").showOptions(socket);
                    break;
                case 82:
                    socket.emit("matchExt", "reload");
                    break;
                case 69:
                    socket.emit("matchExt", "pickItem");
                    break;
            }
        });

        this.input.on('pointermove', function (pointer) {
            if(this.focusedPlayer)
            {
                var angle = Phaser.Math.Angle.Between(1920 / 2, 1080 / 2, pointer.x, pointer.y);
                this.focusedPlayer.rotation = angle;
                socket.emit("matchExt", "rotatePlayer", [angle]);
            }
        }, this);

        this.input.on('pointerdown', function (pointer) {
            if(this.focusedPlayer)
                socket.emit("matchExt", "shoot");
        }, this);
    }

    update(time, delta)
    {
        try
        {
            if(this.waitingForMatch)
            {
                this.timeToWait -= delta;

                if(this.timeToWait <= 1)
                {
                    this.loadingPercentage.text = "Waiting for response from server...";
                    this.centerInContainer(this.background, this.loadingPercentage);
                    this.waitingForMatch = false;
                }
                else if(Math.ceil(this.timeToWait / 1000) != Math.ceil((this.timeToWait + delta) / 1000))
                {
                    this.loadingPercentage.text = "Match starting in " + Math.ceil(this.timeToWait / 1000) + "...";
                    this.centerInContainer(this.background, this.loadingPercentage);
                }
            }
        } catch(e) {}
    }

    handleWorldResponse(socket, responseType, args)
    {
        switch(responseType)
        {
            case "leaveMatch":
                this.leaveMatch(socket);
                break;
            case "matchFail":
                this.matchFail(socket);
                break;
            case "startMatch":
                this.startMatch(socket, args);
                break;
            case "focusedPlayer":
                this.setFocusedPlayerId(args);
                break;
            case "playerRotated":
                this.playerRotated(args);
                break;
            case "playerMoved":
                this.playerMoved(args);
                break;
            case "playerShot":
                this.playerShot(args);
                break;
            case "weaponUpdate":
                game.scene.getScene("UIScene").updateWeaponHUD(args);
                break;
            case "playerKilled":
                game.scene.getScene("UIScene").killedSomeone(args);
                break;
            case "healthUpdate":
                game.scene.getScene("UIScene").updateHealth(args);
                break;
            case "killed":
                game.scene.getScene("UIScene").gotKilled(socket, args);
                break;
            case "playerLeft":
                this.playerLeft(args);
                break;
            case "ammoUpdate":
                game.scene.getScene("UIScene").updateWeaponHUD(args, false);
                break;
            case "spawnablesUpdate":
                this.updateSpawnables(args);
                break;
            case "damageDealt":
                this.showDamageDealt(args);
                break;
            case "showHint":
                this.showHint(args);
                break;
            case "showEffectOnPlayer":
                this.showEffectOnPlayer(args);
                break;
            case "win":
                game.scene.getScene("UIScene").wonGame(socket, args);
                break;
        }
    }

    showEffectOnPlayer(args)
    {
        var player = this.players[args[0]];
        if(player) 
        {
            switch(args[1])
            {
                case "heal":
                    var health = this.healthEmitter.createEmitter({
                        alpha: { start: 1, end: 0 },
                        scale: { start: 1, end: 0},
                        speed: 100,
                        angle: { min: 180, max: 360 },
                        lifespan: 500,
                        frequency: 200,
                        accelerationY: -400,
                        follow: player.sprite,
                        radial: true
                    });
                    this.time.delayedCall(args[2], function() {
                        this.healthEmitter.removeEmitter(health);
                    }, null, this);
                    break;
                case "reload":
                        var reload = this.reloadAnimEmitter.createEmitter({
                            alpha: { start: 1, end: 0 },
                            scale: { start: 1, end: 0 },
                            speed: 70,
                            lifespan: 500,
                            frequency: 200,
                            follow: player.sprite
                        });
                        this.time.delayedCall(args[2], function() {
                            this.reloadAnimEmitter.removeEmitter(reload);
                        }, null, this);
                        break;
            }
        }
    }

    showHint(args)
    {
        game.scene.getScene("UIScene").showHint(args[0]);

        if(args[1])
            this.time.delayedCall(args[1], this.findNearbySpawnables, null, this);
    }

    showDamageDealt(args)
    {
        var playerGotDamage = this.players[args[0]];
        if(playerGotDamage)
        {
            var damageDealt = this.add.text(playerGotDamage.sprite.x, playerGotDamage.sprite.y, args[1], { fontFamily: 'Rubik', fontSize: '40px', color: "#8b0000", fontStyle: "bold", stroke: "#fff", strokeThickness: 5}).setOrigin(0, 0);
            damageDealt.setDepth(playerGotDamage.sprite.y + playerGotDamage.sprite.height + 10);
            this.tweens.add({
                targets: damageDealt,
                duration: 700,
                ease: 'Sine.easeInOut',
                y: playerGotDamage.sprite.y - 100,
                alpha: {
                    getStart: () => 1,
                    getEnd: () => 0
                },
                onComplete: () => {
                    damageDealt.destroy();
                }
            });
        } 
    }

    updateSpawnables(args)
    {
        if(args[0] !== -1)
        {
            try { this.spawnablesSprites[args[0]].destroy(); } catch(e) {}
            this.spawnables.splice(args[0], 1);
            this.spawnablesSprites.splice(args[0], 1);
        }

        for(var spawnable = 0; spawnable < args[1].length; spawnable++)
        {
            this.spawnables.push(args[1][spawnable]);
            this.spawnablesSprites.push(this.physics.add.image(args[1][spawnable].x, args[1][spawnable].y, args[1][spawnable].type, args[1][spawnable].spriteKey).setOrigin(0, 0));
            this.spawnablesSprites[this.spawnablesSprites.length - 1].setDepth(args[1][spawnable].y);
        }

        this.findNearbySpawnables();
    }

    playerLeft(args)
    {
        if(Object.keys(this.players).indexOf(String(args[0])) !== -1)
        {
            for(var playerHitbox = 0; playerHitbox < this.playerHitboxes.length; playerHitbox++)
            {
                if(this.playerHitboxes[playerHitbox] === this.players[args[0]].sprite)
                {
                    this.playerHitboxes[playerHitbox].destroy();
                    this.playerHitboxes.splice(playerHitbox, 1);
                    break;
                }
            }
            delete this.players[args[0]];
        }

    }

    playerShot(args)
    {
        if(args[0] === this.focusedPlayerId)
            this.playerBullets.fireBullet(args);
        else
        {
            for(var player in this.players)
            {
                if(player === String(args[0]))
                {
                    this.enemyBullets.fireBullet(args, this.players[player].sprite);
                    break;
                }
            }
        }

        let bulletDistanceX = Math.abs(this.focusedPlayer.x - args[4]);
        let bulletDistanceY = Math.abs(this.focusedPlayer.y - args[5]);
        let bulletDistance = Math.sqrt(Math.pow(bulletDistanceX, 2) + Math.pow(bulletDistanceY, 2));
        if(bulletDistance < args[8])
        {
            let bulletVolume = 1 - bulletDistance / args[8];
            this.sound.play('shootSound', {volume: bulletVolume});
        }
    }

    playerMoved(args)
    {
        this.players[args[0]].sprite.x = args[1];
        this.players[args[0]].sprite.y = args[2];
        this.players[args[0]].sprite.rotation = args[3];
        this.players[args[0]].sprite.setDepth(this.players[args[0]].sprite.y + this.players[args[0]].sprite.height);
        
        if(args[0] === this.focusedPlayerId && Object.keys(this.players).indexOf(String(args[0])) !== -1)
            this.findNearbySpawnables();

        this.backgroundFollowsCamera();
    }

    findNearbySpawnables()
    {
        var spawnableKey = -1;
        for(var spawnable = 0; spawnable < this.spawnables.length; spawnable++)
        {
            if(this.boxCircle(this.spawnables[spawnable].x, this.spawnables[spawnable].y, this.spawnables[spawnable].width, this.spawnables[spawnable].height, this.focusedPlayer.x, this.focusedPlayer.y, this.players[this.focusedPlayerId].hitboxDiameter / 2))
            {
                spawnableKey = spawnable;
                break;
            }
        }

        if(spawnableKey !== -1)
            game.scene.getScene("UIScene").showHint(this.hints.pickupHint + " " + this.spawnables[spawnableKey].name);
        else
            game.scene.getScene("UIScene").hintsMenu.setAlpha(0);
    }

    playerRotated(args)
    {
        this.players[args[0]].sprite.rotation = args[1];
    }

    setFocusedPlayerId(args)
    {
        this.focusedPlayerId = args[0];
    }

    startMatch(socket, args)
    {
        try
        {
            this.background.destroy();
            this.loadingShadow.alpha = 0;
            this.loadingText.destroy();
            this.loadingPercentage.destroy();
        }
        catch(e) {}
        this.cameras.main.setBounds(-1024, -1024, args[0] + 1024, args[1] + 1024);

        try
        {
            this.background = this.add.tileSprite(-1024, -1024, args[0] + 1024, args[1] + 1024, 'matchTile').setOrigin(0, 0);
        }
        catch(e)
        {
            try
            {
                if(this.background)
                    this.background.destroy();
                this.background = this.add.tileSprite(0, 0, 1920, 1080, 'matchTile');
                this.tileResourceFailed = true;
            }
            catch(e)
            {
                var UIScene = game.scene.getScene("UIScene");
                game.scene.bringToTop("UIScene");
                UIScene.showMessage("GAMEPLAY ERROR", "Your device is unable to handle ShootThis' graphics. Try changing the renderer to CANVAS in the lobby.\nIf the issue persists, nothing can be done, as the problem is your hardware.\nClick OK to go back to the lobby.", "false", null, null, () => {
                    this.leaveMatch(socket);
                });
                return;
            }
            
        }

        try
        {
            //          2
            // walls - 1 3
            //          4
            //args[5] - gameWidth, args[6] - gameHeight, args[7] - shorter side of tile's length
            this.obstacles.push(this.add.tileSprite(0, 0, args[7], args[6], 'wallSprite', 'wall-tile1.png').setOrigin(0, 0)); //wall 1
            this.obstacles.push(this.add.tileSprite(args[7], 0, args[5] - args[7], args[7], 'wallSprite', 'wall-tile2.png').setOrigin(0, 0)); //wall 2
            this.obstacles.push(this.add.tileSprite(args[5] - args[7], 0, args[7], args[6], 'wallSprite', 'wall-tile1.png').setOrigin(0, 0)); //wall 3
            this.obstacles.push(this.add.tileSprite(args[7], args[6] - args[7], args[5] - args[7], args[7], 'wallSprite', 'wall-tile2.png').setOrigin(0, 0)); //wall 4
            
            //enable physics on the walls
            this.physics.world.enable(this.obstacles);
        }
        catch(e)
        {
            var UIScene = game.scene.getScene("UIScene");
            game.scene.bringToTop("UIScene");
            UIScene.showMessage("GAMEPLAY ERROR", "Your device is unable to handle ShootThis' graphics. Try changing the renderer to CANVAS in the lobby.\nIf the issue persists, nothing can be done, as the problem is your hardware.\nClick OK to go back to the lobby.", "false", null, null, () => {
                this.leaveMatch(socket);
            });
            return;
        }

        this.players = args[2];
        this.spawnables = args[4];

        //spawn obstacles
        for(var obstacle = 0; obstacle < args[3].length; obstacle++)
        {
            this.obstacles.push(this.physics.add.image(args[3][obstacle].x, args[3][obstacle].y, 'obstacleSprites', args[3][obstacle].type + ".png").setOrigin(0, 0));
            this.obstacles[this.obstacles.length - 1].setDepth(args[3][obstacle].y);
        }

        //spawn spawnables
        for(var spawnable = 0; spawnable < args[4].length; spawnable++)
        {
            this.spawnablesSprites.push(this.physics.add.image(args[4][spawnable].x, args[4][spawnable].y, args[4][spawnable].type, args[4][spawnable].spriteKey).setOrigin(0, 0));
            this.spawnablesSprites[this.spawnablesSprites.length - 1].setDepth(args[4][spawnable].y);
        }

        //spawn players
        for(var player in this.players)
        {
            this.players[player].sprite = this.physics.add.sprite(this.players[player].x, this.players[player].y, 'characterSprites', this.players[player].character + ".png").setOrigin(this.players[player].centerX, this.players[player].centerY).setCircle(this.players[player].hitboxDiameter / 2);
            this.players[player].sprite.setDepth(this.players[player].y + this.players[player].sprite.height);
            if(player == this.focusedPlayerId)
            {
                this.players[player].sprite.setFrame(this.players[player].character + "_focused.png");
                this.focusedPlayer = this.players[player].sprite;
                this.cameras.main.startFollow(this.focusedPlayer);
                this.backgroundFollowsCamera();
            }
            else
                this.playerHitboxes.push(this.players[player].sprite);
        }

        //particle emitters
        this.smokeEmitter = this.add.particles("emitters", "smoke-puff.png");
        this.bloodEmitter = this.add.particles("emitters", "blood.png");
        this.healthEmitter = this.add.particles("emitters", "health.png");
        this.reloadAnimEmitter = this.add.particles("emitters", "ammo.png");
        this.smokeEmitter.setDepth(args[1]);
        this.bloodEmitter.setDepth(args[1] + 1);
        this.healthEmitter.setDepth(args[1] + 2);
        this.reloadAnimEmitter.setDepth(args[1] + 3);

        //initialize bullet groups
        this.enemyBullets = new Bullets(this, args[8] * (Object.keys(this.players).length + 1));
        this.playerBullets = new Bullets(this, args[8] * 2);

        //initialize enemy bullets' colliders
        this.physics.add.overlap(this.enemyBullets, this.obstacles, this.justHideBullet, null, this);
        this.physics.add.overlap(this.enemyBullets, this.focusedPlayer, this.playerGotShot, null, this);
        this.physics.add.overlap(this.enemyBullets, this.playerHitboxes, this.enemyPlayerGotShot, null, this);
        
        //initialize player bullets' colliders
        this.physics.add.overlap(this.playerBullets, this.obstacles, this.justHideBullet, null, this);
        this.physics.add.overlap(this.playerBullets, this.playerHitboxes, this.justHideBloodBullet, null, this);

        this.hints = args[9];

        game.scene.getScene("UIScene").playMatchMusic();

        game.scene.getScene("UIScene").startTimer(args[10]);
    }

    justHideBullet(hitObject, bullet)
    {
        bullet.toggleBullet(false, 0xcbcbcb);
    }

    justHideBloodBullet(hitObject, bullet)
    {
        bullet.toggleBullet(false, false, "blood", hitObject);
    }

    enemyPlayerGotShot(hitObject, bullet)
    {
        if(hitObject !== bullet.playerSprite)
            bullet.toggleBullet(false, false, "blood", hitObject);
    }

    playerGotShot(hitObject, bullet)
    {
        bullet.toggleBullet(false, false, "blood", hitObject);
        this.socket.emit("matchExt", "gotShot", [bullet.playerId, bullet.damage]);
    }
    
    bulletDied(bullet, tint = false, type = "none", player = null)
    {
        switch(type)
        {
            case "blood":
                let blood = this.bloodEmitter.createEmitter({
                    alpha: { start: 1, end: 0 },
                    scale: { start: 0.5, end: 0},
                    tint: 0xe90000,
                    speed: 500,
                    angle: { min: 0, max: 360 },
                    lifespan: 200,
                    frequency: 10,
                    maxParticles: 5,
                    x: player.x,
                    y: player.y
                });
                blood.onParticleDeath(this.checkEmitterDone, this);
                break;

            default:
                let smoke = this.smokeEmitter.createEmitter({
                    alpha: { start: 1, end: 0 },
                    scale: { start: 0.5, end: 2.5 },
                    speed: 20,
                    angle: { min: -85, max: -95 },
                    tint: 0xff6c00,
                    blendMode: 'ADD',
                    rotate: { min: -180, max: 180 },
                    lifespan: { min: 500, max: 800 },
                    frequency: 110,
                    maxParticles: 1,
                    x: bullet.x,
                    y: bullet.y
                });
                smoke.onParticleDeath(this.checkEmitterDone, this);
                if(tint)
                    smoke.setTint(tint);
                break;
        }
    }

    checkEmitterDone(particle)
    {
        if(particle.emitter.atLimit())
            particle.emitter.manager.removeEmitter(particle.emitter);
    }

    leaveMatch(socket)
    {
        game.scene.start("LobbyScene", { x: 960, y: 540, socket: this.socket});
        socket.emit("gameExt", "cancelJoin");
        game.scene.sendToBack("UIScene");
        game.scene.stop("UIScene");
        game.scene.stop("MatchScene");
    }

    matchFail(socket)
    {
        this.loadingShadow.alpha = 0;
        this.loadingText.destroy();
        this.loadingPercentage.destroy();
        game.scene.getScene("UIScene").showMessage("CANNOT JOIN MATCH", "Everybody has left the match. You can try joining another one in the lobby.", "false", null, null, () => {
            game.scene.getScene("UIScene").messageOkBtn.anims.play('loginBtnClicked'); 
            game.scene.getScene("UIScene").messageContainer.alpha = 0;
            game.scene.getScene("UIScene").leaveMatch(socket);
        });
    }

    backgroundFollowsCamera()
    {
        if(this.tileResourceFailed)
        {
            this.background.x = this.focusedPlayer.x;
            this.background.y = this.focusedPlayer.y;
        }
    }

    centerInContainer(container, element, y = false, x = true)
    {
        if(x)
            element.x = container.x + Math.floor((container.width - element.width) / 2);
        if(y)
            element.y = container.y + Math.floor((container.height - element.height) / 2);
    }

    /**
     * box-circle collision
     * @param {number} xb top-left corner of box
     * @param {number} yb top-left corner of box
     * @param {number} wb width of box
     * @param {number} hb height of box
     * @param {number} xc center of circle
     * @param {number} yc center of circle
     * @param {number} rc radius of circle
     * 
     * Credits David Figatner - https://github.com/davidfig/intersects
     *  
     * His function is included here outside of the module for efficiency sake
    */

    boxCircle(xb, yb, wb, hb, xc, yc, rc)
    {
        var hw = wb / 2
        var hh = hb / 2
        var distX = Math.abs(xc - (xb + wb / 2))
        var distY = Math.abs(yc - (yb + hb / 2))

        if (distX > hw + rc || distY > hh + rc)
        {
            return false
        }

        if (distX <= hw || distY <= hh)
        {
            return true
        }

        var x = distX - hw
        var y = distY - hh
        return x * x + y * y <= rc * rc
    }
}