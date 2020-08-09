class MatchScene extends Phaser.Scene
{

    constructor (config)
    {
        super(config);
    }

    initVariables()
    {
        this.loadingPercentage;
        this.messageContainer;
        this.messageTitle;
        this.messageText;
        this.messageNoBtn;
        this.messageOkBtn;
        this.messageYesBtn;
        this.okText;
        this.yesText;
        this.noText;
        this.loadingText;
        this.loadingShadow;
        this.background;
        this.timeToWait = 0;
        this.waitingForMatch = false;
        this.socket;
        this.showingOptions = false;
        this.players = {};
        this.spawnables = {};
        this.obstacles = {};
        this.backgroundTile;
        this.focusedPlayer = null;
        this.focusedPlayerId = -1;
    }

    create(data)
    {
        if(data.socket && data.timeToWait)
        {
            this.initVariables();
            this.socket = data.socket;

            this.messageContainer = this.add.container(0, 0);
            var shadow = this.add.rectangle(960, 540, 1920, 1080, "0x000000", 0.6);
            var msgbg = this.add.image(960, 540, "messageBG");
            this.messageTitle = this.add.text(960, 420, "WARNING", { fontFamily: 'Rubik', fontSize: '64px', color: "#fff", fontStyle: "bold"});
            this.messageTitle.setOrigin(0.5, 0.5);
            this.messageText = this.add.text(960, 520, "This is some warning/error message and we have a placeholder here.\n\nAnd this is a place holder for a new line.", { fontFamily: 'Rubik', fontSize: '32px', color: "#fff"});
            this.messageText.setAlign("center");
            this.messageText.setOrigin(0.5, 0.5);
            this.messageContainer.add(shadow);
            this.messageContainer.add(msgbg);
            this.messageContainer.add(this.messageTitle);
            this.messageContainer.add(this.messageText);
            this.messageContainer.alpha = 0;

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
            switch(event.which)
            {
                case 87:
                    //player moves up
                    break;
                case 83:
                    //player moves down
                    break;
                case 65:
                    //player moves left
                    break;
                case 68:
                    //player moves right
                    break;
            }
        });

        this.input.keyboard.on('keyup', (event) => {
            switch(event.which)
            {
                case 27:
                    this.showOptions(socket);
                    break;
            }
        });

        this.input.on('pointermove', function (pointer) {
            if(this.focusedPlayer)
            {
                var angle = Phaser.Math.Angle.Between(1920 / 2, 1080 / 2, pointer.x, pointer.y);
                this.focusedPlayer.rotation = angle;
            }
        }, this);
    }

    showOptions(socket)
    {
        if(!this.showingOptions)
        {
            this.showingOptions = true;
            var overlayItems = [];

            var shadow = this.add.rectangle(0, 0, 1920, 1080, "0x000000", 0.6).setOrigin(0, 0);

            var returnToMatchBtn = this.add.sprite(0, 500, 'wideBtn', 'wideBtn0001.png').setOrigin(0, 0);
            this.centerInContainer(this.loadingShadow, returnToMatchBtn);
            var returnToMatchBtnText = this.add.text(0, 510, "Return to Match", { fontFamily: 'Rubik', fontSize: '35px'}).setOrigin(0, 0);
            this.centerInContainer(returnToMatchBtn, returnToMatchBtnText);

            var returnToLobbyBtn = this.add.sprite(0, 600, 'wideBtn', 'wideBtn0001.png').setOrigin(0, 0);
            this.centerInContainer(this.loadingShadow, returnToLobbyBtn);
            var returnToLobbyBtnText = this.add.text(0, 610, "Return to Lobby", { fontFamily: 'Rubik', fontSize: '35px'}).setOrigin(0, 0);
            this.centerInContainer(returnToLobbyBtn, returnToLobbyBtnText);

            overlayItems.push(shadow);
            overlayItems.push(returnToMatchBtn);
            overlayItems.push(returnToMatchBtnText);
            overlayItems.push(returnToLobbyBtn);
            overlayItems.push(returnToLobbyBtnText);

            for(var i in overlayItems)
                this.children.bringToTop(overlayItems[i]);

            returnToMatchBtn.setInteractive().on('pointerdown', () => {
                if(!this.messageContainer.alpha)
                {
                    for(var i in overlayItems)
                    {
                        try { overlayItems[i].destroy() } catch(e) {}
                    }
                    this.loadingShadow.alpha = 0;
                    this.showingOptions = false;
                }
            });

            returnToLobbyBtn.setInteractive().on('pointerdown', () => {
                if(!this.messageContainer.alpha)
                {
                    for(var i in overlayItems)
                    {
                        try { overlayItems[i].destroy() } catch(e) {}
                    }
                    this.loadingShadow.alpha = 0;
                    this.showingOptions = false;
                    this.leaveMatch(socket);
                }
            });
        }
    }

    update(time, delta)
    {
        try
        {
            if(this.waitingForMatch)
            {
                if(this.timeToWait <= 1)
                {
                    this.loadingPercentage.text = "Waiting for response from server...";
                    this.centerInContainer(this.background, this.loadingPercentage);
                    this.waitingForMatch = false;
                }
                else
                {
                    this.timeToWait -= delta;
                    if(Math.ceil(this.timeToWait / 1000) != Math.ceil((this.timeToWait + delta) / 1000))
                    {
                        this.loadingPercentage.text = "Match starting in " + Math.ceil(this.timeToWait / 1000) + "...";
                        this.centerInContainer(this.background, this.loadingPercentage);
                    }
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
        }
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
        this.physics.world.setBounds(0, 0, args[0], args[1], 1, 1, 1, 1);
        this.cameras.main.setBounds(-512, -512, args[0] + 512, args[1] + 512);
        this.backgroundTile = this.add.tileSprite(-512, -512, args[0] + 512, args[1] + 512, 'matchTile').setOrigin(0, 0);
        
        this.players = args[2];
        this.obstacles = args[3];
        this.spawnables = args[4];

        //add first obstacles to scene, then spawnables

        for(var player in this.players)
        {
            var playerAdded = this.add.sprite(this.players[player].x, this.players[player].y, 'characterSprites', this.players[player].character + ".png");
            if(playerAdded.width !== playerAdded.width)
                console.log("WARNING: Misconfigured width in config file for character " + this.players[player].character);
            if(playerAdded.height !== playerAdded.height)
                console.log("WARNING: Misconfigured height in config file for character " + this.players[player].character);
            if(player == this.focusedPlayerId)
            {
                this.focusedPlayer = playerAdded;
                this.cameras.main.startFollow(this.focusedPlayer);
            }
        }
    }

    leaveMatch(socket)
    {
        game.scene.start("LobbyScene", { x: 960, y: 540, socket: this.socket});
        socket.emit("gameExt", "cancelJoin");
        game.scene.stop("MatchScene");
    }

    matchFail(socket)
    {
        this.loadingShadow.alpha = 0;
        this.loadingText.destroy();
        this.loadingPercentage.destroy();
        this.showMessage("CANNOT JOIN MATCH", "Everybody has left the match. You can try joining another one in the lobby.", "false", null, null, () => {
            this.messageOkBtn.anims.play('loginBtnClicked'); 
            this.messageContainer.alpha = 0;
            this.leaveMatch(socket);
        });
    }

    showMessage(title, message, yesno = "none", yesCallback = () => {this.messageYesBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;}, noCallback = () => {this.messageNoBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;}, okCallback = () => {this.messageOkBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;})
    {
        this.messageTitle.text = title;
        this.messageText.text = message;
        this.children.bringToTop(this.messageContainer);

        try { this.messageYesBtn.destroy(); } catch(e) {}
        try { this.yesText.destroy(); } catch(e) {}
        try { this.messageNoBtn.destroy(); } catch(e) {}
        try { this.noText.destroy(); } catch(e) {}
        try { this.messageOkBtn.destroy(); } catch(e) {}
        try { this.okText.destroy(); } catch(e) {}

        switch(yesno)
        {
            case "true":
                this.messageYesBtn = this.add.sprite(548, 660, 'mediumBtn', 'mediumBtn0001.png');
                this.yesText = this.add.text(548, 640, "Yes", { fontFamily: 'Rubik', fontSize: '64px'});
                this.yesText.setOrigin(0.5, 0.5);
                this.messageContainer.add(this.messageYesBtn);
                this.messageContainer.add(this.yesText);
                this.messageNoBtn = this.add.sprite(1372, 660, 'mediumBtn', 'mediumBtn0001.png');
                this.noText = this.add.text(1372, 640, "No", { fontFamily: 'Rubik', fontSize: '64px'});
                this.noText.setOrigin(0.5, 0.5);
                this.messageContainer.add(this.messageNoBtn);
                this.messageContainer.add(this.noText);
                this.messageYesBtn.setInteractive().on('pointerdown', yesCallback);
                this.messageNoBtn.setInteractive().on('pointerdown', noCallback);
                break;
            case "false":
                this.messageOkBtn = this.add.sprite(960, 660, 'mediumBtn', 'mediumBtn0001.png');
                this.okText = this.add.text(960, 640, "OK", { fontFamily: 'Rubik', fontSize: '64px'});
                this.okText.setOrigin(0.5, 0.5);
                this.messageContainer.add(this.messageOkBtn);
                this.messageContainer.add(this.okText);
                this.messageOkBtn.setInteractive().on('pointerdown', okCallback);
                break;
        }

        this.messageContainer.alpha = 1;
    }

    centerInContainer(container, element, y = false, x = true)
    {
        if(x)
            element.x = container.x + Math.floor((container.width - element.width) / 2);
        if(y)
            element.y = container.y + Math.floor((container.height - element.height) / 2);
    }
}