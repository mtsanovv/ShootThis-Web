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
        this.character;
        this.isJoiningMatch = false;
        this.matchStatusText;
        this.matchLoadingIcon;
        this.matchMenuBg;
        this.isHost = false;
        this.minPlayersPerMatch = 5;
        this.voteChangeHostBtn = null;
        this.startMatchBtn = null;
        this.voteChangeHostBtnText = null;
        this.startMatchBtnText = null;
        this.hasVoted = false;
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
        this.messageContainer.alpha = 0;

        this.loadingShadow = this.add.rectangle(0, 0, 1920, 1080, "0x000000", 0.6).setOrigin(0, 0);
        this.loadingShadow.alpha = 0;

        if(data.socket === false)
        {
            this.background = this.add.image(960, 540, 'loginbg');

            this.loadingShadow.alpha = 1;
            this.children.bringToTop(this.loadingShadow);

            this.loadingText = this.add.sprite(960, 550, 'connectingAnim', 'connectingAnim0001.png');
            this.children.bringToTop(this.loadingText);

            this.loadingText.anims.play('connectingAnimation');

            this.loadingPercentage = this.add.text(960, 790, "Connecting to game server...", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'});
            this.loadingPercentage.setOrigin(0.5, 0.5);
            this.children.bringToTop(this.loadingPercentage);

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
                {
                    if(getCookie("music") === "true")
                        this.lobbyMusic = this.sound.play('lobbyMusic', {volume: this.musicVolume, loop: true});
                    this.initLobby(socket);
                }
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
            case "charactersData":
                this.showCharacterSelection(socket, args);
                break;
            case "changeCharacter":
                this.changeCharacter(socket, args);
                break;
            case "minPlayersForMatch":
                this.showHowToPlay(1, args);
                break;
            case "joinMatch":
                this.matchJoined(socket, args);
                break;
            case "updateMatch":
                this.updateMatch(socket, args);
                break;
            case "changeHost":
                this.changeHost(socket, args);
                break;
            case "startMatch":
                this.startMatch(socket, args);
                break;
        }
    }

    showPlayer(socket, args)
    {
        var statsbg = this.add.image(950, 530, 'statsbg').setOrigin(0, 0);
        var nameText = this.add.text(950, 550, args[0], {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF', fontStyle: 'bold'}).setOrigin(0, 0);
        this.centerInContainer(statsbg, nameText);

        this.add.text(980, 600, "Level: " + args[1].level, {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'}).setOrigin(0, 0);
        
        var progressBarBg;
        if(game.renderer.type === Phaser.WEBGL) progressBarBg = this.add.image(950, 650, 'xpprogressbarbg').setOrigin(0, 0);
        else progressBarBg =  this.add.image(950, 650, 'xpprogressbarbgCANVAS').setOrigin(0, 0);
        this.centerInContainer(statsbg, progressBarBg);
        progressBarBg.alpha = 0.3;
        var progressBar = this.add.graphics(progressBarBg.x, progressBarBg.y);
        progressBar.fillStyle(0xffd200);
        progressBar.fillRect(progressBarBg.x, progressBarBg.y, (args[1].xp / args[1].xpToLevel) * progressBarBg.width, progressBarBg.height);
        if(game.renderer.type === Phaser.WEBGL)
        {
            var mask = this.add.image(950, 650, 'xpprogressbarbg').setOrigin(0, 0);
            mask.x = progressBarBg.x;
            mask = mask.createBitmapMask();
            progressBar.setMask(mask);
        }

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
                socket.emit("gameExt", "getCharacters");
            }
        });

        this.character = this.add.image(480, 0, 'characterLobby' + args[1].character).setOrigin(0, 0);
        this.character.y = 1080 - this.character.height - 5;
    }

    showCharacterSelection(socket, args)
    {
        var overlayItems = [];
        var inputGroup = [];

        this.loadingShadow.alpha = 1;
        this.children.bringToTop(this.loadingShadow);
        
        var titleText = this.add.text(0, 10, "CHOOSE YOUR CHARACTER", { fontFamily: 'Rubik', fontSize: '70px', fontStyle: 'bold'}).setOrigin(0, 0);
        this.centerInContainer(this.loadingShadow, titleText);
        var closeBtn = this.add.sprite(0, 965, 'mediumBtn', 'mediumBtn0001.png').setOrigin(0, 0);
        this.centerInContainer(this.loadingShadow, closeBtn);
        var closeBtnText = this.add.text(0, 985, "Back", { fontFamily: 'Rubik', fontSize: '60px'}).setOrigin(0, 0);
        this.centerInContainer(closeBtn, closeBtnText);

        for(var i in args[0])
        {
            var characterBg = this.add.image(Math.floor((1920 - Object.keys(args[0]).length * 450 - (Object.keys(args[0]).length - 1) * 40 ) / 2) + i * (450 + 40), 125, 'characterSelectionCharacterBackground').setOrigin(0, 0);
            var character = this.add.image(480, 105, 'characterLobby' + i).setOrigin(0, 0).setScale(0.7, 0.7);
            character.width = character.width * character.scaleX;
            character.height = character.height * character.scaleY;
            this.centerInContainer(characterBg, character);
            var characterName = this.add.text(0, character.y + character.height + 15, args[0][i].name, { fontFamily: 'Rubik', fontSize: '60px'}).setOrigin(0, 0);
            this.centerInContainer(characterBg, characterName);
            var characterTitle = this.add.text(0, characterName.y + characterName.height, args[0][i].title, { fontFamily: 'Rubik', fontSize: '30px'}).setOrigin(0, 0);
            this.centerInContainer(characterBg, characterTitle);
            character.y = characterBg.y + Math.floor((characterBg.height - character.height - characterName.height - characterTitle.height - 15) / 2);
            characterName.y = character.y + character.height + 15;
            characterTitle.y = characterName.y + characterName.height;

            inputGroup.push(characterBg);
            
            overlayItems.push(characterBg);
            overlayItems.push(character);
            overlayItems.push(characterName);
            overlayItems.push(characterTitle);
        }

        var characterSelection = this.add.group(inputGroup);

        this.input.setHitArea(characterSelection.getChildren()).on('gameobjectdown', function(pointer, gameObject) {
            if(!this.scene.messageContainer.alpha)
            {
                var id = String(Math.floor((gameObject.x - 245 * (-Object.keys(args[0]).length + 4)) / 490));
                socket.emit("gameExt", "changeCharacter", [id]);
                for(var j in overlayItems)
                {
                    try { overlayItems[j].destroy(); } catch(e) {}
                }
                this.scene.input.removeAllListeners('gameobjectdown'); 
                this.scene.loadingShadow.alpha = 0;
            }
        });

        overlayItems.push(closeBtn);
        overlayItems.push(closeBtnText);
        overlayItems.push(titleText);

        for(var i in overlayItems)
            this.children.bringToTop(overlayItems[i]);

        closeBtn.setInteractive().on('pointerdown', () => {
            if(!this.messageContainer.alpha)
            {
                for(var i in overlayItems)
                {
                    try { overlayItems[i].destroy() } catch(e) {}
                }
                this.input.removeAllListeners('gameobjectdown'); 
                this.loadingShadow.alpha = 0;
            }
        });
    }

    changeCharacter(socket, args)
    {
        try { this.character.destroy(); } catch(e) {}
        this.character = this.add.image(480, 0, 'characterLobby' + args[0]).setOrigin(0, 0);
        this.character.y = 1080 - this.character.height - 5;
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
                socket.emit("gameExt", "requestMinPlayersForMatch");
            }
        });

        this.matchMenuBg = this.add.image(1340, 720, 'lobbyBottomRightButtonsBg').setOrigin(0, 0);
        var joinMatchBtn = this.add.sprite(1340, 730, 'mediumBtn', 'mediumBtn0001.png').setOrigin(0, 0);
        this.centerInContainer(this.matchMenuBg, joinMatchBtn);
        var joinMatchBtnText = this.add.text(1340, 745, "Join match", { fontFamily: 'Rubik', fontSize: '60px'}).setOrigin(0, 0);
        this.centerInContainer(joinMatchBtn, joinMatchBtnText);

        joinMatchBtn.setInteractive().on('pointerdown', () => {
            if(!this.loadingShadow.alpha && !this.messageContainer.alpha)
            {
                joinMatchBtn.anims.play('loginBtnClicked');
                this.joinMatch(socket, joinMatchBtnText, joinMatchBtn);
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
        if(game.renderer.type === Phaser.CANVAS && checkCookie("renderer") !== "canvas")
            rendererBtn.visible = false;
        else
        {
            rendererBtn.setInteractive().on('pointerdown', () => {
                if(!this.loadingShadow.alpha && !this.messageContainer.alpha)
                {
                    rendererBtn.anims.play('squareBtnClicked');
                    switch(game.renderer.type)
                    {
                        case Phaser.CANVAS:
                            this.showMessage("CONFIRM RENDERER CHANGE", "You are switching to the WebGL renderer, which may result in better quality, but worse performance on weaker machines.\n\nThe page will be reloaded if you confirm the change, continue?", "true", () => {
                                setCookie("renderer", "", 0);
                                location.reload();
                            });
                            break;
                        case Phaser.WEBGL:
                            this.showMessage("CONFIRM RENDERER CHANGE", "You are switching to the CANVAS renderer, which may result in worse quality, but better performance on weaker machines.\nWebGL is the default setting.\nThe page will be reloaded if you confirm the change, continue?", "true", () => {
                                setCookie("renderer", "canvas", 365);
                                location.reload();
                            });
                            break;
                    }
                }
            });
        }
        if(game.renderer.type === Phaser.CANVAS)
            rendererIcon.setFrame('rendererIcon0002.png');

        this.centerInContainer(muteMusicBtn, muteMusicTxt);
        this.centerInContainer(muteSoundsBtn, muteSoundsTxt);
        this.centerInContainer(rendererBtn, rendererTxt);
    }

    showHowToPlay(screen, args)
    {
        var overlayItems = [];
        var pageTitle;

        this.loadingShadow.alpha = 1;
        this.children.bringToTop(this.loadingShadow);

        var titleText = this.add.text(0, 15, "HOW TO PLAY", { fontFamily: 'Rubik', fontSize: '90px', fontStyle: 'bold'}).setOrigin(0, 0);
        this.centerInContainer(this.loadingShadow, titleText);
        var closeBtn = this.add.sprite(0, 965, 'mediumBtn', 'mediumBtn0001.png').setOrigin(0, 0);
        this.centerInContainer(this.loadingShadow, closeBtn);
        var closeBtnText = this.add.text(0, 985, "Back", { fontFamily: 'Rubik', fontSize: '60px'}).setOrigin(0, 0);
        this.centerInContainer(closeBtn, closeBtnText);

        switch(screen)
        {
            case 1:
                pageTitle = this.add.text(0, 120, "ABOUT THE LOBBY", { fontFamily: 'Rubik', fontSize: '70px'}).setOrigin(0, 0);
                this.centerInContainer(this.loadingShadow, pageTitle);
                var lobbyText1 = this.add.text(0, pageTitle.y + pageTitle.height + 20, "The lobby is basically the main menu of ShootThis. From it, you can access your stats, personalize your account and control your gaming experience. There are 3 sections: experience controls, player customization and match controls.", { fontFamily: 'Rubik', fontSize: '25px', wordWrap: { width: 1800, useAdvancedWrap: true }}).setOrigin(0, 0);
                this.centerInContainer(this.loadingShadow, lobbyText1);
                var lobbyText2 = this.add.text(lobbyText1.x, lobbyText1.y + lobbyText1.height, "\nExperience controls:\nThese are located on the bottom left of your screen and consists of the following: a button to control the music, a button to control the sound and a button to control the game quality/performance (Renderer).\n\n\t- Mute/Unmute Music - this option mutes or unmutes all music game-wide, respectively. The default of that button is whatever you chose at the \"Enable Audio\" prompt when you first logged in. If you change this setting, it is saved and the only way to toggle music is to click that button.\n\t- Mute/Allow Sounds - mutes/unmutes all audio from the game for the current session (until you refresh the page), which means that no sound or music will be played, anywhere. The way to toggle audio again is to click that button or refresh the page.\n\t- Renderer - this toggles between WebGL and CANVAS mode. WebGL has more extras when displaying graphics and is supported by most modern browsers, however, it can be very resource-demanding, especially on older machines. CANVAS is the more lightweight solution, but the graphical effects may not be as amazing as WebGL. The default value is WebGL (if your browser supports it), otherwise CANVAS will be chosen by default. The only way to change between the rendering engines is to use that toggle.\n\nPlayer customization/stats:\nThis is right next to the experience controls. It displays your character, as well as other stats. You can change your character through the \"Change Character\" menu.\n\nMatch controls:\nThey are next to the player stats section. Using the \"Join Match\" button you can join a queue for a match. Underneath it, you can see the current status of the queue. Whenever the current queue is created, a host is automatically assigned. The host is allowed to start the match only when there are at least " + args[0] + " players. If enough players join the queue, it's better to wait for the system to automatically start a full match. If you want the host to be reassigned, you need to click \"Vote: Change Host\" and if at least " + args[1] + "/" + args[2] + " of players in the queue vote (and there are at least 5 players) the system will assign the host role to someone else. Voting to change the host is useful when everyone is tired of waiting and they want a smaller match and the current host is unwilling to start one.", { fontFamily: 'Rubik', fontSize: '25px', wordWrap: { width: 1800 }}).setOrigin(0, 0);
                
                var instructionsBg = this.add.rectangle(lobbyText1.x - 10, lobbyText1.y - 10, 1810, lobbyText1.height + lobbyText2.height + 20, "0x622e00", 0.8).setOrigin(0, 0);
                
                var nextPageBtn = this.add.sprite(closeBtn.x + closeBtn.width + 20, closeBtn.y, 'mediumBtn', 'mediumBtn0001.png').setOrigin(0, 0);
                var nextPageText = this.add.text(0, closeBtnText.y, "Page " + String(screen + 1), { fontFamily: 'Rubik', fontSize: '60px'}).setOrigin(0, 0);
                this.centerInContainer(nextPageBtn, nextPageText);

                nextPageBtn.setInteractive().on('pointerdown', () => {
                    if(!this.messageContainer.alpha)
                    {
                        for(var i in overlayItems)
                        {
                            try { overlayItems[i].destroy() } catch(e) {}
                        }
                        this.input.removeAllListeners('gameobjectdown'); 
                        this.showHowToPlay(screen + 1, args);
                    }
                });

                overlayItems.push(instructionsBg);
                overlayItems.push(lobbyText1);
                overlayItems.push(lobbyText2);
                overlayItems.push(nextPageBtn);
                overlayItems.push(nextPageText);
                break;
            case 2:
                pageTitle = this.add.text(0, 120, "ABOUT THE MATCHES", { fontFamily: 'Rubik', fontSize: '70px'}).setOrigin(0, 0);
                this.centerInContainer(this.loadingShadow, pageTitle);
                var lobbyText1 = this.add.text(0, pageTitle.y + pageTitle.height + 20, "TBA", { fontFamily: 'Rubik', fontSize: '25px', wordWrap: { width: 1800, useAdvancedWrap: true }}).setOrigin(0, 0);
                this.centerInContainer(this.loadingShadow, lobbyText1);

                var instructionsBg = this.add.rectangle(lobbyText1.x - 10, lobbyText1.y - 10, 1810, lobbyText1.height + 20, "0x622e00", 0.8).setOrigin(0, 0);
                
                var prevPageBtn = this.add.sprite(closeBtn.x - closeBtn.width - 20, closeBtn.y, 'mediumBtn', 'mediumBtn0001.png').setOrigin(0, 0);
                var prevPageText = this.add.text(0, closeBtnText.y, "Page " + String(screen - 1), { fontFamily: 'Rubik', fontSize: '60px'}).setOrigin(0, 0);
                this.centerInContainer(prevPageBtn, prevPageText);

                prevPageBtn.setInteractive().on('pointerdown', () => {
                    if(!this.messageContainer.alpha)
                    {
                        for(var i in overlayItems)
                        {
                            try { overlayItems[i].destroy() } catch(e) {}
                        }
                        this.input.removeAllListeners('gameobjectdown'); 
                        this.showHowToPlay(screen - 1, args);
                    }
                });

                overlayItems.push(instructionsBg);
                overlayItems.push(lobbyText1);
                overlayItems.push(lobbyText2);
                overlayItems.push(prevPageBtn);
                overlayItems.push(prevPageText);
                break;
        }

        overlayItems.push(closeBtn);
        overlayItems.push(closeBtnText);
        overlayItems.push(titleText);
        overlayItems.push(pageTitle);

        for(var i in overlayItems)
            this.children.bringToTop(overlayItems[i]);

        closeBtn.setInteractive().on('pointerdown', () => {
            if(!this.messageContainer.alpha)
            {
                for(var i in overlayItems)
                {
                    try { overlayItems[i].destroy() } catch(e) {}
                }
                this.input.removeAllListeners('gameobjectdown'); 
                this.loadingShadow.alpha = 0;
            }
        });

    }

    joinMatch(socket, joinMatchBtnText, joinMatchBtn)
    {
        if(this.isJoiningMatch)
        {
            this.isJoiningMatch = false;
            socket.emit("gameExt", "cancelJoin");
            this.sound.play('quitMatchBtnSound');
            joinMatchBtnText.text = "Join match";
            this.centerInContainer(joinMatchBtn, joinMatchBtnText);
            try 
            { 
                this.matchLoadingIcon.destroy(); 
                this.matchStatusText.destroy();
            } catch(e) {}
            try
            {
                this.voteChangeHostBtnText.destroy();
                this.voteChangeHostBtn.destroy();
            } catch(e) {}
            try
            {
                this.startMatchBtnText.destroy();
                this.startMatchBtn.destroy();
            } catch(e) {}
            this.isHost = false;
            this.hasVoted = false;
        }
        else
        {
            this.isJoiningMatch = true;
            socket.emit("gameExt", "joinMatch");
            this.sound.play('joinMatchBtnSound');
            joinMatchBtnText.text = "Quit queue";
            this.centerInContainer(joinMatchBtn, joinMatchBtnText);
            this.matchLoadingIcon = this.add.sprite(1340, 850, 'connectingAnim', 'connectingAnim0001.png').setOrigin(0, 0).setScale(0.1, 0.1);
            this.matchLoadingIcon.anims.play('connectingAnimation');
            this.setMatchStatusText(["Looking for available matches..."]);
        }
    }

    setMatchStatusText(args)
    {
        if(this.isJoiningMatch)
        {
            try { this.matchStatusText.destroy(); } catch(e) {}
            this.matchStatusText = this.add.text(1340, 855, args[0], { fontFamily: 'Rubik', fontSize: '25px'}).setOrigin(0, 0);
            this.matchLoadingIcon.x = this.matchMenuBg.x + Math.floor((this.matchMenuBg.width - this.matchLoadingIcon.displayWidth - this.matchStatusText.width - 10) / 2);
            this.matchStatusText.x = this.matchLoadingIcon.x + this.matchLoadingIcon.displayWidth + 10;
        }
    }

    matchJoined(socket, args)
    {
        if(this.isJoiningMatch)
        {
            this.isHost = args[3];
            this.minPlayersPerMatch = args[1];
            this.setMatchStatusText([args[0] + "/" + args[2] + " players in queue"]);
            this.showAdditionalJoinButtons(socket, args);
        }
    }

    startMatch(socket, args)
    {
        this.sound.play('joinMatchBtnSound');
        try
        {
            game.scene.add("MatchScene", MatchScene, true, { x: 960, y: 540, socket: socket, timeToWait: args[0], createMatchExtListener: true});
        }
        catch(e)
        {
            game.scene.start("MatchScene", { x: 960, y: 540, socket: socket, timeToWait: args[0], createMatchExtListener: false});
        }
        this.sound.removeByKey('lobbyMusic');
        game.scene.remove("LobbyScene");
    }

    showAdditionalJoinButtons(socket, args)
    {
        if(args[0] >= this.minPlayersPerMatch)
        {
            try
            {
                this.voteChangeHostBtnText.destroy();
                this.voteChangeHostBtn.destroy();
            } catch(e) {}
            try
            {
                this.startMatchBtnText.destroy();
                this.startMatchBtn.destroy();
            } catch(e) {}

            if(!this.hasVoted && args[0] > 1)
            {
                this.voteChangeHostBtn = this.add.sprite(950, 950, 'mediumThinBtn', 'mediumThinBtn0001.png').setOrigin(0, 0);
                this.centerInContainer(this.matchMenuBg, this.voteChangeHostBtn);
                this.voteChangeHostBtnText = this.add.text(950, 955, "Vote: Change Host", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'}).setOrigin(0, 0);
                this.centerInContainer(this.voteChangeHostBtn, this.voteChangeHostBtnText);

                this.voteChangeHostBtn.setInteractive().on('pointerdown', () => {
                    if(!this.loadingShadow.alpha && !this.messageContainer.alpha)
                    {
                        this.voteChangeHostBtn.anims.play('mediumThinBtnClicked');
                        this.hasVoted = true;
                        socket.emit("gameExt", "voteChangeHost");
                        try { this.voteChangeHostBtnText.destroy(); } catch(e) {}
                        this.voteChangeHostBtnText = this.add.text(950, 920, "This text will disappear when the host is changed,\nthat is, when enough players vote.\nLearn more by clicking on \"How to Play\".", { align: 'center', fontFamily: 'Rubik', fontSize: '25px'}).setOrigin(0, 0);
                        this.centerInContainer(this.matchMenuBg, this.voteChangeHostBtnText);
                        try { this.voteChangeHostBtn.destroy(); } catch(e) {}
                    }
                });
            }
            else if(this.hasVoted)
            {
                this.voteChangeHostBtnText = this.add.text(950, 920, "This text will disappear when the host is changed,\nthat is, when enough players vote.\nLearn more by clicking on \"How to Play\".", { align: 'center', fontFamily: 'Rubik', fontSize: '25px'}).setOrigin(0, 0);
                this.centerInContainer(this.matchMenuBg, this.voteChangeHostBtnText);
            }

            if(this.isHost)
            {
                this.startMatchBtn = this.add.sprite(950, 1010, 'mediumThinBtn', 'mediumThinBtn0001.png').setOrigin(0, 0);
                this.centerInContainer(this.matchMenuBg, this.startMatchBtn);
                this.startMatchBtnText = this.add.text(950, this.startMatchBtn.y + 5, "Start Match", {fontFamily: 'Rubik', fontSize: '32px', fill: '#FFF'}).setOrigin(0, 0);
                this.centerInContainer(this.startMatchBtn, this.startMatchBtnText);

                this.startMatchBtn.setInteractive().on('pointerdown', () => {
                    if(!this.loadingShadow.alpha && !this.messageContainer.alpha)
                    {
                        this.startMatchBtn.anims.play('mediumThinBtnClicked');
                        socket.emit("gameExt", "startMatch");
                    }
                });
            }
        }
    }

    updateMatch(socket, args)
    {
        if(this.isJoiningMatch)
        {
            this.setMatchStatusText([args[0] + "/" + args[2] + " players in queue"]);
            this.showAdditionalJoinButtons(socket, args);
        }
    }

    changeHost(socket, args)
    {
        if(this.isJoiningMatch)
        {
            this.hasVoted = false;
            if(this.isHost)
            {
                try
                {
                    this.startMatchBtnText.destroy();
                    this.startMatchBtn.destroy();
                } catch(e) {}
            }
            this.isHost = args[1];
            this.showAdditionalJoinButtons(socket, args);
        }
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

    centerInContainer(container, element, y = false, x = true)
    {
        if(x)
            element.x = container.x + Math.floor((container.width - element.width) / 2);
        if(y)
            element.y = container.y + Math.floor((container.height - element.height) / 2);
    }
}