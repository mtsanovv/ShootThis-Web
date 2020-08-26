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
        this.obstacles = [];
        this.focusedPlayer = null;
        this.focusedPlayerId = -1;
        this.background;
        this.tileResourceFailed = false;
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
        }
    }

    playerMoved(args)
    {
        this.players[args[0]].sprite.x = args[1];
        this.players[args[0]].sprite.y = args[2];
        this.players[args[0]].sprite.rotation = args[3];
        this.backgroundFollowsCamera();
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
            this.add.tileSprite(-1024, -1024, args[0] + 1024, args[1] + 1024, 'matchTile').setOrigin(0, 0);
        }
        catch(e)
        {
            try
            {
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
            this.add.tileSprite(0, 0, args[7], args[6], 'wallSprite', 'wall-tile1.png').setOrigin(0, 0); //wall 1
            this.add.tileSprite(args[7], 0, args[5] - args[7], args[7], 'wallSprite', 'wall-tile2.png').setOrigin(0, 0); //wall 2
            this.add.tileSprite(args[5] - args[7], 0, args[7], args[6], 'wallSprite', 'wall-tile1.png').setOrigin(0, 0); //wall 3
            this.add.tileSprite(args[7], args[6] - args[7], args[5] - args[7], args[7], 'wallSprite', 'wall-tile2.png').setOrigin(0, 0); //wall 4
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
        this.obstacles = args[3];
        this.spawnables = args[4];

        //add first obstacles to scene, then spawnables

        for(var obstacle in this.obstacles)
            this.obstacles[obstacle].sprite = this.add.sprite(this.obstacles[obstacle].x, this.obstacles[obstacle].y, 'obstacleSprites', this.obstacles[obstacle].type + ".png").setOrigin(0, 0);

        for(var player in this.players)
        {
            this.players[player].sprite = this.add.sprite(this.players[player].x, this.players[player].y, 'characterSprites', this.players[player].character + ".png").setOrigin(this.players[player].centerX, this.players[player].centerY);
            if(player == this.focusedPlayerId)
            {
                this.focusedPlayer = this.players[player].sprite;
                this.cameras.main.startFollow(this.focusedPlayer);
                this.backgroundFollowsCamera();
            }
        }
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
}