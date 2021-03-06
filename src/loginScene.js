class LoginScene extends Phaser.Scene
{

    constructor (config)
    {
        super(config);
        this.loadingPercentage;
        this.loginLogo;
        this.loginElementsAlpha = -0.5;
        this.usernameFieldAsset;
        this.usernameField;
        this.passwordFieldAsset;
        this.passwordField;
        this.username = "";
        this.password = "";
        this.rememberAccount;
        this.saveAccount = false;
        this.loginBtn;
        this.loginBtnText;
        this.messageContainer;
        this.messageTitle;
        this.messageText;
        this.messageNoBtn;
        this.messageOkBtn;
        this.messageYesBtn;
        this.okText;
        this.yesText;
        this.noText;
        this.hasConnected = false;
        this.loadingText;
        this.loadingShadow;
        this.timesDisconnected = 0;
        this.loginForm = false;
        this.loginText;
        this.switchToLoginForm;
        this.closedUsernameEditor = true;
        this.closedPasswordEditor = true;
        this.pingTimes = {};
        this.serversProcessed = 0;
        this.servers = [];
    }

    preload() 
    {

        this.loadingPercentage = this.add.text(960, 830, "Loading: ", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'});
        this.loadingPercentage.setOrigin(0.5, 0.5);
        //Load game assets
        this.load.image('loginbg', 'assets/loginbg.png');
        this.load.image('loginlogo', 'assets/loginLogo.png');
        this.load.multiatlas('formFields', 'assets/forms/fields.json', 'assets/forms');
        this.load.multiatlas('rememberAccount', 'assets/forms/checkbox.json', 'assets/forms');
        this.load.multiatlas('mediumBtn', 'assets/forms/mediumBtn.json', 'assets/forms');
        this.load.image('messageBG', 'assets/messageBG.png');
        this.load.multiatlas('connectingAnim', 'assets/loading/connectingAnim.json', 'assets/loading');
        this.load.multiatlas('wideBtn', 'assets/forms/wideBtn.json', 'assets/forms');
        this.load.image('lobbybg', 'assets/lobby/lobbybg.png');
        this.load.image('lobbyCloud1', 'assets/lobby/cloud1.png');
        this.load.image('lobbyCloud2', 'assets/lobby/cloud2.png');
        this.load.image('lobbyCloud3', 'assets/lobby/cloud3.png');
        this.load.image('statsbg', 'assets/lobby/statsbg.png');
        this.load.image('xpprogressbarbg', 'assets/lobby/xpProgessBar.png');
        this.load.multiatlas('mediumThinBtn', 'assets/forms/mediumThinBtn.json', 'assets/forms');
        this.load.image('lobbyButtonsRightBg', 'assets/lobby/buttonsRightBg.png');
        this.load.image('lobbyBottomRightButtonsBg', 'assets/lobby/bottomRightButtonsBg.png');
        this.load.image('lobbySoundControlButtonsBg', 'assets/lobby/soundControlButtonsBg.png');
        this.load.multiatlas('squareBtn', 'assets/forms/squareBtn.json', 'assets/forms');
        this.load.multiatlas('musicIcon', 'assets/lobby/musicIcon.json', 'assets/lobby');
        this.load.multiatlas('soundIcon', 'assets/lobby/soundIcon.json', 'assets/lobby');
        this.load.multiatlas('rendererIcon', 'assets/lobby/rendererIcon.json', 'assets/lobby');
        this.load.image('xpprogressbarbgCANVAS', 'assets/lobby/xpProgessBarCANVAS.png');
        this.load.image('characterSelectionCharacterBackground', 'assets/lobby/characterSelectionCharacterBackground.png');

        //Load sounds
        this.load.audio('lobbyMusic', 'assets/sound/lobbyMusic.mp3');
        this.load.audio('quitMatchBtnSound', 'assets/sound/quitmatchbtn.mp3');
        this.load.audio('joinMatchBtnSound', 'assets/sound/joinmatchbtn.mp3');
        this.load.audio('matchMusic', 'assets/sound/matchMusic.mp3');
        this.load.audio('winMusic', 'assets/sound/winMusic.mp3');
        this.load.audio('loadingScreenMusic', 'assets/sound/loadingScreenMusic.mp3');
        this.load.audio('shootSound', 'assets/sound/shootSound.mp3');
        this.load.audio('eliminated', 'assets/sound/eliminated.mp3');
        this.load.audio('playerKilled', 'assets/sound/playerKilled.mp3');


        //Load character assets
        this.load.image('characterLobby0', 'assets/lobby/characters/0.png');
        this.load.image('characterLobby1', 'assets/lobby/characters/1.png');

        //Load match assets
        this.load.multiatlas('characterSprites', 'assets/match/characters.json', 'assets/match');
        this.load.image('matchTile', 'assets/match/tile.png');
        this.load.multiatlas('wallSprite', 'assets/match/wall.json', 'assets/match');
        this.load.multiatlas('obstacleSprites', 'assets/match/obstacles.json', 'assets/match');
        this.load.image('bullet', 'assets/match/bullet.png');
        this.load.multiatlas('emitters', 'assets/match/emitters.json', 'assets/match');
        this.load.multiatlas('spawnablesSprites', 'assets/match/spawnables.json', 'assets/match');

        //Load match UI assets
        this.load.multiatlas('matchUIElements', 'assets/match/UI/elements.json', 'assets/match/UI');
        this.load.multiatlas('matchUIHopups', 'assets/match/UI/hopups.json', 'assets/match/UI');
        this.load.multiatlas('matchUIMags', 'assets/match/UI/mags.json', 'assets/match/UI');
        this.load.image('champion', 'assets/match/UI/champion.png');
        this.load.image('bleedBG', 'assets/match/UI/bleedBG.png');


        //Login plugins
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'js/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        this.load.plugin('rextexteditplugin', 'js/rextexteditplugin.min.js', true);

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
        //all button and connecting animations here 

        var loginBtnClicked = this.anims.generateFrameNames('mediumBtn', {
            start: 2, end: 14, zeroPad: 4,
            prefix: 'mediumBtn', suffix: '.png'
        });

        this.anims.create({ key: 'loginBtnClicked', frames: loginBtnClicked, frameRate: 24});

        var connectingAnimFrames = this.anims.generateFrameNames('connectingAnim', {
            start: 1, end: 70, zeroPad: 4,
            prefix: 'connectingAnim', suffix: '.png'
        });

        this.anims.create({ key: 'connectingAnimation', frames: connectingAnimFrames, frameRate: 24, repeat: -1 });

        var squareBtnClicked = this.anims.generateFrameNames('squareBtn', {
            start: 2, end: 14, zeroPad: 4,
            prefix: 'squareBtn', suffix: '.png'
        });

        this.anims.create({ key: 'squareBtnClicked', frames: squareBtnClicked, frameRate: 24});

        var wideBtnClicked = this.anims.generateFrameNames('wideBtn', {
            start: 2, end: 14, zeroPad: 4,
            prefix: 'wideBtn', suffix: '.png'
        });

        this.anims.create({ key: 'wideBtnClicked', frames: wideBtnClicked, frameRate: 24});

        var mediumThinBtnClicked = this.anims.generateFrameNames('mediumThinBtn', {
            start: 2, end: 14, zeroPad: 4,
            prefix: 'mediumThinBtn', suffix: '.png'
        });

        this.anims.create({ key: 'mediumThinBtnClicked', frames: mediumThinBtnClicked, frameRate: 24});

        //end button and connecting animations

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

        this.loadingPercentage = this.add.text(960, 790, "Connecting to login server...", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'});
        this.loadingPercentage.setOrigin(0.5, 0.5);

        try
        {
            if(jQuery.isEmptyObject(loginConfig))
            {
                this.loadingShadow.destroy();
                this.loadingText.destroy();
                this.loadingPercentage.destroy();
                this.showMessage("ERROR", "ShootThis can't connect due to bad configuration. Please try again later or contact us.");
            }
            else
                this.attemptConnection(1);
        }
        catch(e)
        {
            this.loadingShadow.destroy();
            this.loadingText.destroy();
            this.loadingPercentage.destroy();
            this.showMessage("ERROR", "ShootThis can't connect due to bad configuration. Please try again later or contact us.");
            return;
        }
    }

    attemptConnection(loginServerId)
    {
        try
        {
            var server = "login" + String(loginServerId);
            if(loginConfig[server].address && loginConfig[server].port && loginConfig[server].protocol)
            {
                var socket = io(loginConfig[server].protocol + loginConfig[server].address + ":" + loginConfig[server].port, {secure: true, transport: ['websocket']});
                socket.on('loginExt', (responseType, args) => {
                    this.handleLoginResponse(socket, responseType, args);
                });
                socket.on('connect_error', (error) => {
                    if(!this.hasConnected)
                    {
                        try 
                        {
                            socket.destroy();
                        } 
                        catch(e){}
                        if(loginServerId == Object.keys(loginConfig).length)
                        {
                            this.loadingShadow.destroy();
                            this.loadingText.destroy();
                            this.loadingPercentage.destroy();
                            if(this.timesDisconnected > 0)
                                this.showMessage("MAXED OUT CAPACITIES", "ShootThis is unable to connect as our capacities are currently maxed out. Please try again later or contact us.");
                            else
                                this.showMessage("CONNECTION FAILURE", "ShootThis is unable to connect. It may be your connection or an issue on our end.\n\nPlease try again later or contact us.");
                        }
                        else
                            this.attemptConnection(loginServerId + 1);
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
                        this.showMessage("DISCONNECTED", "You have been disconnected from ShootThis. Please refresh the page to connect again.");
                    }
                    else
                    {
                        try 
                        {
                            socket.destroy();
                        } 
                        catch(e){}
                        if(loginServerId == Object.keys(loginConfig).length)
                        {
                            this.loadingShadow.destroy();
                            this.loadingText.destroy();
                            this.loadingPercentage.destroy();
                            this.showMessage("MAXED OUT CAPACITIES", "ShootThis is unable to connect as our capacities are currently maxed out. Please try again later or contact us.");
                        }
                        else
                        {
                            this.timesDisconnected++;
                            this.attemptConnection(loginServerId + 1);
                        }
                    }
                });
            }
            else
            {
                this.loadingShadow.destroy();
                this.loadingText.destroy();
                this.loadingPercentage.destroy();
                this.showMessage("ERROR", "ShootThis can't connect due to bad configuration. One or more servers may not be configured properly.\n\nPlease try again later or contact us.");
                return;
            }
        }
        catch(e)
        {
            this.loadingShadow.destroy();
            this.loadingText.destroy();
            this.loadingPercentage.destroy();
            this.showMessage("ERROR", "ShootThis can't connect due to bad configuration. Please try again later or contact us.");
            return;
        }
    }

    handleLoginResponse(socket, responseType, args)
    {
        switch(responseType)
        {
            case "connectionSuccessful":
                this.loadingShadow.destroy();
                this.loadingText.destroy();
                this.loadingPercentage.destroy();
                this.onConnection(socket);
                break;
            case "slFail":
                this.loadingShadow.destroy();
                this.loadingText.destroy();
                this.showMessage("CANNOT SIGN IN", "The saved login data has expired.\n\nYou need to log in again.", "false", null, null, () => {
                    this.loginElementsAlpha = -0.5;
                    this.loginLogo.destroy();
                    this.loginText.destroy();
                    this.switchToLoginForm.destroy();
                    this.loginBtn.destroy();
                    this.loginBtnText.destroy();
                    this.loginForm = true;
                    this.messageOkBtn.anims.play('loginBtnClicked'); 
                    this.messageContainer.alpha = 0;
                    setCookie("savedLogin", "", 0);
                    this.showLoginForm(socket);
                });
                break;
            case "lFail":
                this.loadingShadow.destroy();
                this.loadingText.destroy();
                this.showMessage("CANNOT LOG IN", "Invalid username or password.\n\nPasswords are case sensitive.", "false");
                break;
            case "sCookie":
                setCookie("savedLogin", args.join(","), 60);
                break;
            case "ls":
                this.handleLoginSuccessful(socket, args);
                break;
        }
    }

    handleLoginSuccessful(oldSocket, args)
    {
        setCookie("loginToken", args[0].join(","), 0.00694);
        try
        {
            oldSocket.destroy();
        } catch(e) {}
        
        this.servers = args[1];
        this.findBestServer();
    }

    findBestServer()
    {
        if(this.servers.length)
        {
            if(this.serversProcessed == this.servers.length)
            {
                var pings = [];
                for (var server in this.pingTimes)
                    pings.push([server, this.pingTimes[server].ping, this.pingTimes[server].name]);

                var availableServers = [];

                for(var i = 0; i < pings.length; i++)
                {
                    if(pings[i][1] == -1)
                        continue;
                    else
                        availableServers.push(pings[i]);
                }
                this.loadingShadow.destroy();
                this.loadingText.destroy();
                if(availableServers.length)
                {
                    game.scene.add("ServersScene", ServersScene, true, { x: 960, y: 540, availableServers: availableServers});
                    game.scene.remove("LoginScene");
                }
                else
                    this.showMessage("CANNOT JOIN SERVER", "ShootThis is unable to find an available game server. Please try again later.");
            }
            else if(this.serversProcessed < this.servers.length)
            {
                this.pingTimes[this.servers[this.serversProcessed]] = {ping: -1, begin: 0, end: 0, name: "", address: this.servers[this.serversProcessed]};
                var socket = io(this.servers[this.serversProcessed], {secure: true, timeout: 1000, transport: ['websocket']});
                socket.on('gameExt', (recvResponse, args) => {
                    if(recvResponse == "connectionSuccessful")
                    {
                        this.pingTimes[this.servers[this.serversProcessed]].begin = new Date();
                        socket.emit("gameExt", "p");
                    }
                    else if(recvResponse == "p")
                    {
                        this.pingTimes[this.servers[this.serversProcessed]].end = new Date();
                        this.pingTimes[this.servers[this.serversProcessed]].ping = this.pingTimes[this.servers[this.serversProcessed]].end - this.pingTimes[this.servers[this.serversProcessed]].begin;
                        this.pingTimes[this.servers[this.serversProcessed]].name = args[0];
                        try 
                        {
                            socket.destroy();
                        } 
                        catch(e){}
                        this.serversProcessed++;
                        this.findBestServer();
                    }
                });
                socket.on('connect_error', () => {
                    try 
                    {
                        socket.destroy();
                    } 
                    catch(e){}
                    this.serversProcessed++;
                    this.findBestServer();
                });
                socket.on('disconnect', () => {
                    try 
                    {
                        socket.destroy();
                    } 
                    catch(e){} 
                    this.serversProcessed++;
                    this.findBestServer();
                });
            }
        }
        else
        {
            this.loadingShadow.destroy();
            this.loadingText.destroy();
            this.showMessage("CANNOT JOIN SERVER", "ShootThis cannot find an available game server. Please try again later.");
        }
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
    
    onConnection(socket)
    {
        this.hasConnected = true;

        if(checkCookie("savedLogin"))
        {
            if(getCookie("savedLogin").split(",")[0] && getCookie("savedLogin").split(",")[1])
                this.showSavedLogin(socket);
        }
        else
        {
            this.loginForm = true;
            this.showLoginForm(socket);
        }
        
    }

    showSavedLogin(socket)
    {
        this.loginLogo = this.add.sprite(960, 100, 'loginlogo');
        this.loginLogo.alpha = 0;

        this.loginText = this.add.text(945, 370, "Currently logged in as: " + getCookie("savedLogin").split(",")[0], { fontFamily: 'Rubik', fontSize: '64px'});
        this.loginText.setOrigin(0.5, 0.5);
        this.loginText.alpha = 0;

        this.switchToLoginForm = this.add.text(945, 650, "Click here to log in with another account", { fontFamily: 'Rubik', fontSize: '32px', color: "#622e00"});
        this.switchToLoginForm.setOrigin(0.5, 0.5);
        this.switchToLoginForm.alpha = 0;

        this.loginBtn = this.add.sprite(960, 800, 'mediumBtn', 'mediumBtn0001.png');
        this.loginBtn.alpha = 0;

        this.loginBtnText = this.add.text(960, 780, "Sign In", { fontFamily: 'Rubik', fontSize: '64px'});
        this.loginBtnText.setOrigin(0.5, 0.5);
        this.loginBtnText.alpha = 0;

        this.loginBtn.setInteractive().on('pointerdown', () => {
            if(!this.messageContainer.alpha && !this.loadingShadow.active)
            {
                this.loginBtn.anims.play('loginBtnClicked');
                this.loadingShadow = this.add.rectangle(960, 540, 1920, 1080, "0x000000", 0.7);
                this.loadingText = this.add.sprite(960, 550, 'connectingAnim', 'connectingAnim0001.png');

                this.loadingText.anims.play('connectingAnimation');

                socket.emit("loginExt", "cc", getCookie("savedLogin").split(","));
            }
        });

        this.switchToLoginForm.setInteractive().on('pointerdown', () => {
            this.showMessage("FORGET THIS ACCOUNT", "Would you like to forget this saved account?", "true", () => {
                setCookie("savedLogin", "", 0);
                this.loginElementsAlpha = -0.5;
                this.loginLogo.destroy();
                this.loginText.destroy();
                this.switchToLoginForm.destroy();
                this.loginBtn.destroy();
                this.loginBtnText.destroy();
                this.loginForm = true;
                this.messageYesBtn.anims.play('loginBtnClicked'); 
                this.messageContainer.alpha = 0;
                this.showLoginForm(socket);
            }, () => {
                this.loginElementsAlpha = -0.5;
                this.loginLogo.destroy();
                this.loginText.destroy();
                this.switchToLoginForm.destroy();
                this.loginBtn.destroy();
                this.loginBtnText.destroy();
                this.loginForm = true;
                this.messageNoBtn.anims.play('loginBtnClicked'); 
                this.messageContainer.alpha = 0;
                this.showLoginForm(socket);
            });
        });
    }

    showLoginForm(socket)
    {
        this.loginLogo = this.add.sprite(960, 100, 'loginlogo');
        this.loginLogo.alpha = 0;

        this.usernameFieldAsset = this.add.sprite(960, 480, 'formFields', 'field0001.png');
        this.usernameFieldAsset.alpha = 0;

        this.usernameField = this.add.text(950, 480, "Username", { fontFamily: 'Rubik', fontSize: '48px', fixedWidth: 700, color: "#a79076"});
        this.usernameField.setOrigin(0.5, 0.5);
        this.usernameField.alpha = 0;

        var onCloseUsernameEditor = function (txtObj)
        {
            this.scene.closedUsernameEditor = true;
            txtObj.style.color = "rgb(167 144 118)";
            this.scene.username = txtObj.text;
            if(txtObj.text == "") 
                txtObj.text = "Username";
            else
                txtObj.style.color = "rgb(98 46 0)";
            this.scene.usernameFieldAsset.setFrame("field0001.png");
        };

	    this.usernameField.setInteractive().on('pointerdown', () => {
            if(!this.messageContainer.alpha)
            {
                this.closedUsernameEditor = false;
                this.usernameFieldAsset.setFrame("field0002.png");
                if(this.usernameField.text == "Username") 
                    this.usernameField.text = "";
                this.usernameField.style.color = "rgb(98 46 0)";
                this.usernameEditor = this.rexUI.edit(this.usernameField, {}, onCloseUsernameEditor);
            }
        });

        this.passwordFieldAsset = this.add.sprite(960, 570, 'formFields', 'field0001.png');
        this.passwordFieldAsset.alpha = 0;

        this.passwordField = this.add.text(950, 570, "Password", { fontFamily: 'Rubik', fontSize: '48px', fixedWidth: 700, color: "#a79076"});
        this.passwordField.setOrigin(0.5, 0.5);
        this.passwordField.alpha = 0;

        var onClosePasswordEditor = function (txtObj)
        {
            this.scene.closedPasswordEditor = true;
            txtObj.style.color = "rgb(167 144 118)";
            this.scene.password = txtObj.text;
            if(txtObj.text == "") 
                txtObj.text = "Password";
            else
            {
                txtObj.style.color = "rgb(98 46 0)";
                for(var c = 0; c < txtObj.text.length; c++)
                    txtObj.text = txtObj.text.substr(0, c) + '●' + txtObj.text.substr(c + 1);
            }
            this.scene.passwordFieldAsset.setFrame("field0001.png");
        };

	    this.passwordField.setInteractive().on('pointerdown', () => {
            if(!this.messageContainer.alpha)
            {
                this.closedPasswordEditor = false;
                this.passwordFieldAsset.setFrame("field0002.png");
                if(this.passwordField.text == "Password") this.passwordField.text = "";
                else if(this.password) this.passwordField.text = this.password;
                this.passwordField.style.color = "rgb(98 46 0)";
                this.passwordEditor = this.rexUI.edit(this.passwordField, {type: "password"}, onClosePasswordEditor);
            }
        });

        this.rememberAccount = this.add.sprite(960, 650, 'rememberAccount', 'checkbox0001.png');
        this.rememberAccount.alpha = 0;

        var checkboxClicked = this.anims.generateFrameNames('rememberAccount', {
            start: 9, end: 20, zeroPad: 4,
            prefix: 'checkbox', suffix: '.png'
        });

        this.anims.create({ key: 'checkboxClicked', frames: checkboxClicked, frameRate: 24});

        this.rememberAccount.setInteractive().on('pointerdown', () => {
            if(!this.messageContainer.alpha)
            {
                if(this.rememberAccount.frame.name == "checkbox0001.png")
                {
                    this.showMessage("CONFIRM REMEMBER ACCOUNT", "Are you sure that you want to remember this account? This will replace any other account you have saved.\n\nIt is not recommended to remember this account if others can access it on this device.", "true", () => {
                        this.messageYesBtn.anims.play('loginBtnClicked'); 
                        this.messageContainer.alpha = 0;
                        this.rememberAccount.anims.play('checkboxClicked');
                        this.saveAccount = true;
                    });
                }
                else
                {
                    this.rememberAccount.setFrame("checkbox0001.png");
                    this.saveAccount = false;
                }
            }
        });

        this.loginBtn = this.add.sprite(960, 800, 'mediumBtn', 'mediumBtn0001.png');
        this.loginBtn.alpha = 0;

        this.loginBtnText = this.add.text(960, 780, "Login", { fontFamily: 'Rubik', fontSize: '64px'});
        this.loginBtnText.setOrigin(0.5, 0.5);
        this.loginBtnText.alpha = 0;

        this.loginBtn.setInteractive().on('pointerdown', () => {
            this.loginBtn.anims.play('loginBtnClicked');
            if(this.closedPasswordEditor)
            {
                if(this.password.length < 7 || this.username.length > 18)
                    this.showMessage("CANNOT LOG IN", "You have to enter a valid password that's between 7 and 18 characters long.", "false");      
            }
            else
            {
                if(this.passwordField.text.length < 7 || this.passwordField.text.length > 18)
                    this.showMessage("CANNOT LOG IN", "You have to enter a valid password that's between 7 and 18 characters long.", "false");
                else
                    this.password = this.passwordField.text;
            }
            if(this.closedUsernameEditor)
            {
                if(this.username.length < 4 || this.username.length > 16)
                    this.showMessage("CANNOT LOG IN", "You have to enter a valid username that's between 4 and 16 characters long.", "false");      
            }
            else
            {
                if(this.usernameField.text.length < 4 || this.usernameField.text.length > 16)
                    this.showMessage("CANNOT LOG IN", "You have to enter a valid username that's between 4 and 16 characters long.", "false");
                else
                    this.username = this.usernameField.text;
            }
            if(!this.messageContainer.alpha && !this.loadingShadow.active)
            {
                this.loadingShadow = this.add.rectangle(960, 540, 1920, 1080, "0x000000", 0.7);
                this.loadingText = this.add.sprite(960, 550, 'connectingAnim', 'connectingAnim0001.png');

                this.loadingText.anims.play('connectingAnimation');
                socket.emit("loginExt", "pl", [this.username, this.password, this.saveAccount]);
            }
        });
    }

    update(time, delta)
    {
        if(this.hasConnected)
        {
            if(this.loginForm)
            {
                if(this.loginElementsAlpha < 1)
                {
                    if(this.loginElementsAlpha >= 0)
                        this.loginLogo.alpha += delta / 1000;
                    this.loginElementsAlpha += delta / 1000;
                }
                else if(this.loginElementsAlpha >= 1 && this.loginElementsAlpha < 2)
                {
                    this.usernameFieldAsset.alpha += delta / 300;
                    this.usernameField.alpha += delta / 300;
                    this.loginElementsAlpha += delta / 300;
                }
                else if(this.loginElementsAlpha >= 2 && this.loginElementsAlpha < 3)
                {
                    this.passwordFieldAsset.alpha += delta / 300;
                    this.passwordField.alpha += delta / 300;
                    this.loginElementsAlpha += delta / 300;
                }
                else if(this.loginElementsAlpha >= 3 && this.loginElementsAlpha < 4)
                {
                    this.rememberAccount.alpha += delta / 300;
                    this.loginElementsAlpha += delta / 300;
                }
                else if(this.loginElementsAlpha >= 4 && this.loginElementsAlpha < 5)
                {
                    this.loginBtn.alpha += delta / 300;
                    this.loginBtnText.alpha += delta / 300;
                    this.loginElementsAlpha += delta / 300;
                }
            }
            else
            {
                if(this.loginElementsAlpha < 1)
                {
                    if(this.loginElementsAlpha >= 0)
                        this.loginLogo.alpha += delta / 1000;
                    this.loginElementsAlpha += delta / 1000;
                }
                else if(this.loginElementsAlpha >= 1 && this.loginElementsAlpha < 2)
                {
                    this.loginText.alpha += delta / 300;
                    this.loginElementsAlpha += delta / 300;
                }
                else if(this.loginElementsAlpha >= 2 && this.loginElementsAlpha < 3)
                {
                    this.switchToLoginForm.alpha += delta / 300;
                    this.loginElementsAlpha += delta / 300;
                }
                else if(this.loginElementsAlpha >= 3 && this.loginElementsAlpha < 4)
                {
                    this.loginBtn.alpha += delta / 300;
                    this.loginBtnText.alpha += delta / 300;
                    this.loginElementsAlpha += delta / 300;
                }
            }
        }
    }
}