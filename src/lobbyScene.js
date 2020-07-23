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
        this.background;
        this.lobbyMusic;
        this.musicVolume = 0.1;
        this.cloudsPlaying = 0;
        this.clouds = [];
    }

    create(data)
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

        this.loadingShadow = this.add.rectangle(960, 540, 1920, 1080, "0x000000", 0.6);
        this.loadingShadow.alpha = 0;
        this.loadingShadow.setDepth(10000);

        if(data.socket === false)
        {
            this.background = this.add.image(960, 540, 'loginbg');

            this.loadingShadow.alpha = 1;

            this.loadingText = this.add.sprite(960, 550, 'connectingAnim', 'connectingAnim0001.png');
            this.loadingText.setDepth(this.loadingShadow.depth + 1);

            this.loadingText.anims.play('connectingAnimation');

            this.loadingPercentage = this.add.text(960, 790, "Connecting to game server...", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'});
            this.loadingPercentage.setOrigin(0.5, 0.5);
            this.loadingPercentage.setDepth(this.loadingShadow.depth + 1);

            if(!getCookie("gameServer") || !getCookie("loginToken"))
            {
                this.loadingShadow.alpha = 0;
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
                        this.loadingShadow.alpha = 0;
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
                        this.loadingShadow.alpha = 0;
                        this.loadingText.destroy();
                        this.loadingPercentage.destroy();
                        this.showMessage("DISCONNECTED", "You have been disconnected from ShootThis. Please refresh the page to connect again.");
                    }
                });
            }
        }
        else
            this.initLobby(data.socket);
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
                this.loadingShadow.alpha = 0;
                this.loadingText.destroy();
                this.loadingPercentage.destroy();
                if(checkCookie("music") === false)  
                    this.askForAudio(socket);
                else
                    if(getCookie("music") === "true")
                        this.lobbyMusic = this.sound.play('lobbyMusic', {volume: this.musicVolume, loop: true});
                    this.initLobby(socket);
                break;
            case "joinFail":
                this.loadingShadow.alpha = 0;
                this.loadingText.destroy();
                this.loadingPercentage.destroy();
                this.showMessage("CANNOT JOIN SERVER", "The server is unable to authenticate you.\n\nPlease refresh the page and try again or contact us.");
                break;
            case "userInfo":
                this.showPlayer(socket, args);
                break;
        }
    }

    showPlayer(socket, args)
    {
        var statsbg = this.add.image(950, 530, 'statsbg').setOrigin(0, 0);
        var nameText = this.add.text(950, 550, args[0], {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF', fontStyle: 'bold'}).setOrigin(0, 0);
        this.centerInContainer(statsbg, nameText);

        this.add.text(980, 600, "Level: " + args[1].level, {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'}).setOrigin(0, 0);
        
        var progressBarBg = this.add.image(950, 650, 'xpprogressbarbg').setOrigin(0, 0);
        this.centerInContainer(statsbg, progressBarBg);
        progressBarBg.alpha = 0.3;
        var progressBar = this.add.graphics(progressBarBg.x, progressBarBg.y);
        progressBar.fillStyle(0xffd200);
        progressBar.fillRect(progressBarBg.x, progressBarBg.y, (args[1].xp / args[1].xpToLevel) * progressBarBg.width, progressBarBg.height);
        var mask = this.add.image(950, 650, 'xpprogressbarbg').setOrigin(0, 0);
        mask.x = progressBarBg.x;
        mask = mask.createBitmapMask();
        progressBar.setMask(mask);

        var xpText = this.add.text(980, 670, args[1].xp + '/' + args[1].xpToLevel + " XP", {fontFamily: 'Rubik', fontSize: '20px', fill: '#FFF'}).setOrigin(0, 0);
        this.centerInContainer(statsbg, xpText);
        
        this.add.text(980, 720, "Kills: " + args[1].kills, {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'}).setOrigin(0, 0);
        this.add.text(980, 770, "Deaths: " + args[1].deaths, {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'}).setOrigin(0, 0);
        this.add.text(980, 820, "K/DR: " + Math.round((args[1].kills / ((args[1].deaths == 0) ? 1 : args[1].deaths) + Number.EPSILON) * 100) / 100, {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'}).setOrigin(0, 0);
        this.add.text(980, 870, "Games played: " + args[1].totalGames, {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'}).setOrigin(0, 0);
        
        this.add.graphics().fillStyle(0xffffff).fillRoundedRect(progressBarBg.x, 920, progressBarBg.width, 3, 2);
        var lastMatchText = this.add.text(950, 930, "Last Match Stats", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF', fontStyle: 'bold'}).setOrigin(0, 0);
        this.centerInContainer(statsbg, lastMatchText)
        var lastMatchKills = this.add.text(950, 965, "Kills: " + args[1].lastMatchKills, {fontFamily: 'Rubik', fontSize: '20px', fill: '#FFF'}).setOrigin(0, 0);
        var damageDone = this.add.text(950, 965, "Damage Done: " + args[1].lastMatchDamageDone, {fontFamily: 'Rubik', fontSize: '20px', fill: '#FFF'}).setOrigin(0, 0);
        lastMatchKills.x = statsbg.x + Math.floor((statsbg.width - (lastMatchKills.width + damageDone.width + 10)) / 2);
        damageDone.x = lastMatchKills.x + lastMatchKills.width + 10;
        
        var lastMatchXp = this.add.text(950, 990, "XP: " + args[1].lastMatchXp, {fontFamily: 'Rubik', fontSize: '20px', fill: '#FFF'}).setOrigin(0, 0);
        var timeElapsed = this.add.text(950, 990, "Time Played: " + ((Math.floor(args[1].lastMatchTimeElapsed / 60000) < 10) ? "0" + String(Math.floor(args[1].lastMatchTimeElapsed / 60000)) : Math.floor(args[1].lastMatchTimeElapsed / 60000)) + ":" + ((((args[1].lastMatchTimeElapsed - Math.floor(args[1].lastMatchTimeElapsed / 60000) * 60000) / 1000) < 10) ? "0" + String((args[1].lastMatchTimeElapsed - Math.floor(args[1].lastMatchTimeElapsed / 60000) * 60000) / 1000) : ((args[1].lastMatchTimeElapsed - Math.floor(args[1].lastMatchTimeElapsed / 60000) * 60000) / 1000)), {fontFamily: 'Rubik', fontSize: '20px', fill: '#FFF'}).setOrigin(0, 0);
        lastMatchXp.x = statsbg.x + Math.floor((statsbg.width - (lastMatchXp.width + timeElapsed.width + 10)) / 2);
        timeElapsed.x = lastMatchXp.x + lastMatchXp.width + 10;

        this.add.graphics().fillStyle(0xffffff).fillRoundedRect(progressBarBg.x, 1020, progressBarBg.width, 3, 2);
        var changeCharacterBtn = this.add.sprite(950, 1030, 'mediumThinBtn', 'mediumThinBtn0001.png').setOrigin(0, 0);
        this.centerInContainer(statsbg, changeCharacterBtn);
        var changeCharacterText = this.add.text(950, 1035, "Change Character", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'}).setOrigin(0, 0);
        this.centerInContainer(changeCharacterBtn, changeCharacterText);

        changeCharacterBtn.setInteractive().on('pointerdown', () => {
            if(!this.loadingShadow.alpha && !this.messageContainer.alpha)
            {
                changeCharacterBtn.anims.play('mediumThinBtnClicked');
                this.showCharacterSelection(socket);
            }
        });
    }

    showCharacterSelection(socket)
    {
        var overlayItems = [];
        this.loadingShadow.alpha = 1;
        //character selection screen
    }

    askForAudio(socket)
    {
        this.showMessage("ENABLE MUSIC?", "Would you like to enable music?", "true", () => {
            this.lobbyMusic = this.sound.play('lobbyMusic', {volume: 0.1, loop: true});
            setCookie("music", "true", 365);
            this.messageYesBtn.anims.play('loginBtnClicked'); 
            this.messageContainer.alpha = 0;
            this.initLobby(socket);
        }, () => {
            this.messageNoBtn.anims.play('loginBtnClicked'); 
            this.messageContainer.alpha = 0;
            setCookie("music", "false", 365);
            this.initLobby(socket);
        });
    }

    initLobby(socket)
    {
        try
        {
            this.background.destroy();
        }
        catch(e) {}

        this.background = this.add.image(960, 540, 'lobbybg');

        this.spawnClouds();

        socket.emit("gameExt", "userInfo");

        var howToPlayBtnBg = this.add.image(1340, 570, 'lobbyButtonsRightBg').setOrigin(0, 0);
        var howToPlayBtn = this.add.sprite(1340, 590, 'mediumBtn', 'mediumBtn0001.png').setOrigin(0, 0);
        this.centerInContainer(howToPlayBtnBg, howToPlayBtn);
        var howToPlayBtnText = this.add.text(1340, 605, "How to Play", { fontFamily: 'Rubik', fontSize: '60px'}).setOrigin(0, 0);
        this.centerInContainer(howToPlayBtn, howToPlayBtnText);

        howToPlayBtn.setInteractive().on('pointerdown', () => {
            if(!this.loadingShadow.alpha && !this.messageContainer.alpha)
            {
                howToPlayBtn.anims.play('loginBtnClicked');
                this.showHowToPlay();
            }
        });

        var matchMenuBg = this.add.image(1340, 720, 'lobbyBottomRightButtonsBg').setOrigin(0, 0);
        var joinMatchBtn = this.add.sprite(1340, 730, 'mediumBtn', 'mediumBtn0001.png').setOrigin(0, 0);
        this.centerInContainer(matchMenuBg, joinMatchBtn);
        var joinMatchBtnText = this.add.text(1340, 745, "Join match", { fontFamily: 'Rubik', fontSize: '60px'}).setOrigin(0, 0);
        this.centerInContainer(joinMatchBtn, joinMatchBtnText);

        joinMatchBtn.setInteractive().on('pointerdown', () => {
            if(!this.loadingShadow.alpha && !this.messageContainer.alpha)
            {
                joinMatchBtn.anims.play('loginBtnClicked');
                this.joinMatch(socket, joinMatchBtnText);
            }
        });

        this.add.image(5, 905, 'lobbySoundControlButtonsBg').setOrigin(0, 0);

        var muteMusicTxt = this.add.text(0, 1050, "Mute Music", { fontFamily: 'Rubik', fontSize: '25px'}).setOrigin(0, 0);
        var muteMusicBtn = this.add.sprite(5, 905, 'squareBtn', 'squareBtn0001.png').setOrigin(0, 0);
        var musicIcon = this.add.sprite(5, 905, 'musicIcon', 'musicIcon0001.png').setOrigin(0, 0);
        muteMusicBtn.setInteractive().on('pointerdown', () => {
            if(!this.loadingShadow.alpha && !this.messageContainer.alpha)
            {
                muteMusicBtn.anims.play('squareBtnClicked');
                if(getCookie("music") !== "true")
                {
                    muteMusicTxt.text = "Mute Music";
                    musicIcon.setFrame('musicIcon0001.png');
                    this.sound.removeByKey('lobbyMusic');
                    this.lobbyMusic = this.sound.play('lobbyMusic', {volume: this.musicVolume, loop: true});
                    setCookie("music", "true", 365);
                }
                else
                {
                    this.sound.stopByKey('lobbyMusic');
                    musicIcon.setFrame('musicIcon0002.png');
                    setCookie("music", "false", 365);
                    muteMusicTxt.text = "Play Music";
                }
            }
        });
        if(getCookie("music") !== "true")
        {
            muteMusicTxt.text = "Play Music";
            musicIcon.setFrame('musicIcon0002.png');
            this.sound.removeByKey('lobbyMusic');
        }

        var muteSoundsTxt = this.add.text(0, 1050, "Mute Sounds", { fontFamily: 'Rubik', fontSize: '25px'}).setOrigin(0, 0);
        var muteSoundsBtn = this.add.sprite(155, 905, 'squareBtn', 'squareBtn0001.png').setOrigin(0, 0);
        var soundsIcon = this.add.sprite(155, 905, 'soundIcon', 'soundIcon0001.png').setOrigin(0, 0);
        muteSoundsBtn.setInteractive().on('pointerdown', () => {
            if(!this.loadingShadow.alpha && !this.messageContainer.alpha)
            {
                muteSoundsBtn.anims.play('squareBtnClicked');
                if(game.sound.mute || gameSoundMuted)
                {
                    muteSoundsTxt.text = "Mute Sounds";
                    soundsIcon.setFrame('soundIcon0001.png');
                    game.sound.mute = false;
                    muteMusicBtn.visible = true;
                    gameSoundMuted = false;
                }
                else
                {
                    muteSoundsTxt.text = "Allow Sounds";
                    soundsIcon.setFrame('soundIcon0002.png');
                    game.sound.mute = true;
                    muteMusicBtn.visible = false;
                    gameSoundMuted = true;
                }
            }
        });
        if(game.sound.mute || gameSoundMuted)
        {
            muteSoundsTxt.text = "Allow Sounds";
            soundsIcon.setFrame('soundIcon0001.png');
        }

        var rendererTxt = this.add.text(0, 1050, "Renderer", { fontFamily: 'Rubik', fontSize: '25px'}).setOrigin(0, 0);
        var rendererBtn = this.add.sprite(305, 905, 'squareBtn', 'squareBtn0001.png').setOrigin(0, 0);
        var rendererIcon = this.add.sprite(305, 905, 'rendererIcon', 'rendererIcon0001.png').setOrigin(0, 0);
        if(game.renderer.type === 1 && checkCookie("renderer") !== "canvas")
            rendererBtn.visible = false;
        else
        {
            rendererBtn.setInteractive().on('pointerdown', () => {
                if(!this.loadingShadow.alpha && !this.messageContainer.alpha)
                {
                    rendererBtn.anims.play('squareBtnClicked');
                    switch(game.renderer.type)
                    {
                        case 1:
                            this.showMessage("CONFIRM RENDERER CHANGE", "You are switching to the WebGL renderer, which may result in better quality, but worse performance on weaker machines.\n\nThe page will be reloaded if you confirm the change, continue?", "true", () => {
                                setCookie("renderer", "", 0);
                                location.reload();
                            });
                            break;
                        case 2:
                            this.showMessage("CONFIRM RENDERER CHANGE", "You are switching to the CANVAS renderer, which may result in worse quality, but better performance on weaker machines.\nWebGL is the default setting.\nThe page will be reloaded if you confirm the change, continue?", "true", () => {
                                setCookie("renderer", "canvas", 365);
                                location.reload();
                            });
                            break;
                    }
                }
            });
        }
        if(game.renderer.type === 1)
            rendererIcon.setFrame('rendererIcon0002.png');

        this.centerInContainer(muteMusicBtn, muteMusicTxt);
        this.centerInContainer(muteSoundsBtn, muteSoundsTxt);
        this.centerInContainer(rendererBtn, rendererTxt);
    }

    showHowToPlay()
    {
        var overlayItems = [];
        this.loadingShadow.alpha = 1;
        //how to play instructions screen
    }

    joinMatch(socket, joinMatchBtnText)
    {

    }

    spawnClouds()
    {
        this.cloudsPlaying = 3;
        for(var i = 0; i < this.cloudsPlaying; i++)
        {
            var cloud = this.add.image(100, i * 50, 'lobbyCloud' + (i + 1));
            cloud.x = -(i + 1) * cloud.width - i * 200;
            cloud.setOrigin(0, 0);
            this.clouds.push(cloud);
        }
    }

    showMessage(title, message, yesno = "none", yesCallback = () => {this.messageYesBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;}, noCallback = () => {this.messageNoBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;}, okCallback = () => {this.messageOkBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0;})
    {
        this.messageTitle.text = title;
        this.messageText.text = message;
8
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

    update(time, delta)
    {
        if(this.cloudsPlaying)
        {
            for(var i = 0; i < this.clouds.length; i++)
            {
                if(this.clouds[i].x > 1920)
                    this.clouds[i].x = -(i + 1) * this.clouds[i].width - i * 200;
                this.clouds[i].x += delta / 20;
            }
        }
    }

    centerInContainer(container, element, y = false)
    {
        element.x = container.x + Math.floor((container.width - element.width) / 2);
        if(y)
            element.y = container.y + Math.floor((container.height - element.height) / 2);
    }
}