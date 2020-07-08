class LobbyScene extends Phaser.Scene
{

    constructor (config)
    {
        super(config);
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
        this.hasConnected = false;
    }

    preload()
    {
        this.loadingPercentage = this.add.text(960, 830, "Loading: ", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'});
        this.loadingPercentage.setOrigin(0.5, 0.5);
        //Load whatever the game needs that's not loaded in login
        this.load.image('map', 'assets/map.png');

        this.load.on('progress', this.onProgress, {loadingPercentage: this.loadingPercentage});
		this.load.on('complete', this.onComplete, {loadingPercentage: this.loadingPercentage});
    }

    onProgress(percentage) 
    {
		percentage = percentage * 100;
        this.loadingPercentage.setText("Loading: " + percentage.toFixed(0) + "%");
	}

    onComplete() 
    {
        game.scene.remove("LoaderScene");
        this.loadingPercentage.destroy();
    }

    create()
    {
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
        this.messageContainer.setDepth(100);
        this.messageContainer.alpha = 0;

        this.add.image(960, 540, 'loginbg');

        this.loadingShadow = this.add.rectangle(960, 540, 1920, 1080, "0x000000", 0.6);
        this.loadingText = this.add.sprite(960, 550, 'connectingAnim', 'connectingAnim0001.png');

        this.loadingText.anims.play('connectingAnimation');

        this.loadingPercentage = this.add.text(960, 790, "Connecting to game server...", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'});
        this.loadingPercentage.setOrigin(0.5, 0.5);

        if(!getCookie("gameServer") || !getCookie("loginToken"))
        {
            this.loadingShadow.destroy();
            this.loadingText.destroy();
            this.loadingPercentage.destroy();
            this.showMessage("CANNOT JOIN SERVER", "The login credentials have expired, please refresh the page and log in again.");
        }
        else
        {
            var socket = io(getCookie("gameServer"), {secure: true, reconnection: false, transport: ['websocket']});
            socket.on('gameExt', (responseType, args) => {
                this.handleWorldResponse(socket, responseType, args);
            });
            socket.on('connect_error', () => {
                if(!this.hasConnected)
                {
                    try 
                    {
                        socket.destroy();
                    } 
                    catch(e){}
                    this.loadingShadow.destroy();
                    this.loadingText.destroy();
                    this.loadingPercentage.destroy();
                    this.showMessage("CONNECTION FAILURE", "ShootThis is unable to connect to the game server. It may be your connection or an issue on our end.\n\nPlease try again later or contact us.");
                }
            });
            socket.on('disconnect', () => {
                if(this.hasConnected)
                {
                    try 
                    {
                        socket.destroy();
                    } 
                    catch(e){}
                }
                if(!this.messageContainer.alpha)
                {
                    this.loadingShadow.destroy();
                    this.loadingText.destroy();
                    this.loadingPercentage.destroy();
                    this.showMessage("DISCONNECTED", "You have been disconnected from ShootThis. Please refresh the page to connect again.");
                }
            });
        }
    }

    handleWorldResponse(socket, responseType, args)
    {
        switch(responseType)
        {
            case "connectionSuccessful":
                this.loadingPercentage.text = "Joining server " + args[0];
                socket.emit("gameExt", "joinServer", getCookie("loginToken").split(","));
                break;
            case "joinOk":
                this.hasConnected = true;
                this.loadingShadow.destroy();
                this.loadingText.destroy();
                this.loadingPercentage.destroy();
                this.initLobby(socket);
                break;
            case "joinFail":
                this.loadingShadow.destroy();
                this.loadingText.destroy();
                this.loadingPercentage.destroy();
                this.showMessage("CANNOT JOIN SERVER", "The server is unable to authenticate you.\n\nPlease refresh the page and try again or contact us.");
                break;
        }
    }

    initLobby(socket)
    {
        //init lobby
    }

    showMessage(title, message, yesno = "none", yesCallback = () => {this.messageYesBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;}, noCallback = () => {this.messageNoBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;}, okCallback = () => {this.messageOkBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;})
    {
        this.messageTitle.text = title;
        this.messageText.text = message;

        try { this.messageYesBtn.destroy(); } catch(e) {}
        try { this.yesText.destroy(); } catch(e) {}
        try { this.messageNoBtn.destroy(); } catch(e) {}
        try { this.noText.destroy(); } catch(e) {}
        try { this.messageOkBtn.destroy(); } catch(e) {}
        try { this.okText.destroy(); } catch(e) {}

        switch(yesno)
        {
            case "true":
                this.messageYesBtn = this.add.sprite(548, 670, 'loginBtn', 'mediumBtn0001.png');
                this.yesText = this.add.text(548, 650, "Yes", { fontFamily: 'Rubik', fontSize: '64px'});
                this.yesText.setOrigin(0.5, 0.5);
                this.messageContainer.add(this.messageYesBtn);
                this.messageContainer.add(this.yesText);
                this.messageNoBtn = this.add.sprite(1372, 670, 'loginBtn', 'mediumBtn0001.png');
                this.noText = this.add.text(1372, 650, "No", { fontFamily: 'Rubik', fontSize: '64px'});
                this.noText.setOrigin(0.5, 0.5);
                this.messageContainer.add(this.messageNoBtn);
                this.messageContainer.add(this.noText);
                this.messageYesBtn.setInteractive().on('pointerdown', yesCallback);
                this.messageNoBtn.setInteractive().on('pointerdown', noCallback);
                break;
            case "false":
                this.messageOkBtn = this.add.sprite(960, 670, 'loginBtn', 'mediumBtn0001.png');
                this.okText = this.add.text(960, 650, "OK", { fontFamily: 'Rubik', fontSize: '64px'});
                this.okText.setOrigin(0.5, 0.5);
                this.messageContainer.add(this.messageOkBtn);
                this.messageContainer.add(this.okText);
                this.messageOkBtn.setInteractive().on('pointerdown', okCallback);
                break;
        }

        this.messageContainer.alpha = 1;
    }
}