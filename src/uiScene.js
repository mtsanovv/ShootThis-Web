class UIScene extends Phaser.Scene
{
    constructor(config)
    {
        super(config);
    }

    initVariables()
    {
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
        this.showingOptions = false;
        this.socket;
        this.weaponMenu;
        this.loadedAmmo;
        this.totalAmmo;
        this.weaponMenuIcons = {};
        this.weaponName;
        this.weaponBg;
        this.matchMusic;
        this.killMenu;
        this.killBg;
        this.kills;
        this.killsBoxes = [];
        this.highestKillBoxY = 1055;
        this.healthBar;
        this.healthBarBg;
        this.healthRectangle;
        this.healthShadow;
        this.sound.pauseOnBlur = false;
    }

    create(data)
    {

        this.initVariables();
        this.socket = data.socket;

        this.background = this.add.image(0, 0, 'loginbg').setOrigin(0, 0);
        this.background.alpha = 0;

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

        this.weaponMenu = this.add.group();
        this.weaponBg = this.add.image(1700, 860, "matchUIElements", "weapon.png").setOrigin(0, 0);
        this.loadedAmmo = this.add.text(1760, 865, "09", { fontFamily: 'Rubik', fontSize: '60px', color: "#fff", fontStyle: "bold"}).setOrigin(0, 0);
        this.totalAmmo = this.add.text(1745, 932, "000", { fontFamily: 'Rubik', fontSize: '60px', color: "#fff", fontStyle: "bold"}).setOrigin(0, 0);
        this.totalAmmo.alpha = 0.6;
        this.weaponMenuIcons.hopup = this.add.sprite(1700, 995, 'matchUIHopups', '00.png').setOrigin(0, 0);
        this.weaponMenuIcons.mag = this.add.sprite(1700, 995, 'matchUIMags', '00.png').setOrigin(0, 0);
        this.weaponMenuIcons.hopup.x = 1715 + Math.floor((185 - (this.weaponMenuIcons.hopup.width + this.weaponMenuIcons.mag.width + 10)) / 2);
        this.weaponMenuIcons.mag.x = this.weaponMenuIcons.hopup.x + this.weaponMenuIcons.hopup.width + 10;
        this.weaponName = this.add.text(1700, 1032, "Weapon", { fontFamily: 'Rubik', fontSize: '25px', color: "#fff"}).setOrigin(0, 0);
        this.centerInContainer(this.weaponBg, this.weaponName);
        this.weaponMenu.add(this.weaponBg);
        this.weaponMenu.add(this.loadedAmmo);
        this.weaponMenu.add(this.totalAmmo);
        this.weaponMenu.add(this.weaponMenuIcons.hopup);
        this.weaponMenu.add(this.weaponMenuIcons.mag);
        this.weaponMenu.add(this.weaponName);
        this.weaponMenu.setAlpha(0);

        this.killMenu = this.add.group();
        this.killBg = this.add.image(1820, 20, "matchUIElements", "kills.png").setOrigin(0, 0);
        this.kills = this.add.text(1870, 23, "00", { fontFamily: 'Rubik', fontSize: '30px', color: "#fff"}).setOrigin(0, 0);
        this.killMenu.add(this.killBg);
        this.killMenu.add(this.kills);
        this.killMenu.setAlpha(0);

        this.healthBar = this.add.group();
        this.healthBarBg = this.add.image(20, 20, "matchUIElements", "health.png").setOrigin(0, 0);
        this.healthBarShadow = this.add.rectangle(65, 0, 100, 25, 0x000000, 0.5).setOrigin(0, 0);
        this.centerInContainer(this.healthBarBg, this.healthBarShadow, true, false);
        this.healthRectangle = this.add.rectangle(this.healthBarShadow.x, this.healthBarShadow.y, this.healthBarShadow.width, this.healthBarShadow.height, 0xffffff, 1).setOrigin(0, 0);
        this.healthBar.add(this.healthBarBg);
        this.healthBar.add(this.healthBarShadow);
        this.healthBar.add(this.healthRectangle);
        this.healthBar.setAlpha(0);

        this.children.bringToTop(this.loadingShadow);

        this.playMusicInMatch();
    }

    gotKilled(socket, args)
    {
        this.sound.play('eliminated');
        this.sound.removeByKey('loadingScreenMusic');
        this.sound.removeByKey('matchMusic');

        var children = this.children.getChildren();
        for(var child in children)
        {
            children[child].alpha = 0;
        }

        this.tweens.add({
            targets: this.loadingShadow,
            duration: 200,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1
            }
        });

        var eliminationContainer = this.add.group();
        var bg = this.add.image(0, 540, "messageBG").setOrigin(0, 0);
        this.centerInContainer(this.loadingShadow, bg, true);
        var killed = this.add.text(0, 420, "KILLED BY ", { fontFamily: 'Rubik', fontSize: '64px', color: "#fff", fontStyle: "bold"}).setOrigin(0, 0);
        var killedBy = this.add.text(0, 420, args[0].toUpperCase(), { fontFamily: 'Rubik', fontSize: '64px', color: "#f30000", fontStyle: "bold"}).setOrigin(0, 0);
        killed.x = Math.floor((1920 - (killed.width + killedBy.width)) / 2);
        killedBy.x = killed.x + killed.width;
        var youPlaced = this.add.text(0, 510, "You placed ", { fontFamily: 'Rubik', fontSize: '32px', color: "#fff"}).setOrigin(0, 0);
        var placement = this.add.text(0, 510, args[1], { fontFamily: 'Rubik', fontSize: '32px', color: "#ff4500", fontStyle: "bold"}).setOrigin(0, 0);
        youPlaced.x =  Math.floor((1920 - (youPlaced.width + placement.width)) / 2);
        placement.x = youPlaced.x + youPlaced.width;
        eliminationContainer.add(bg);
        eliminationContainer.add(killed);
        eliminationContainer.add(killedBy);
        eliminationContainer.add(youPlaced);
        eliminationContainer.add(placement);
        eliminationContainer.setAlpha(0);

        this.tweens.add({
            targets: eliminationContainer.getChildren(),
            delay: 200,
            duration: 200,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1
            }
        });
        this.tweens.add({
            targets: this.background,
            delay: 400,
            duration: 200,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1
            }
        });

        var returnToLobbyBtnGroup = this.add.group();
        var returnToLobbyBtn = this.add.sprite(0, 600, 'wideBtn', 'wideBtn0001.png').setOrigin(0, 0);
        this.centerInContainer(this.loadingShadow, returnToLobbyBtn);
        var returnToLobbyBtnText = this.add.text(0, 610, "Return to Lobby", { fontFamily: 'Rubik', fontSize: '35px'}).setOrigin(0, 0);
        this.centerInContainer(returnToLobbyBtn, returnToLobbyBtnText);
        returnToLobbyBtnGroup.add(returnToLobbyBtn);
        returnToLobbyBtnGroup.add(returnToLobbyBtnText);
        returnToLobbyBtnGroup.setAlpha(0);

        this.tweens.add({
            targets: returnToLobbyBtnGroup.getChildren(),
            delay: 600,
            duration: 200,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1
            },
            onComplete: () => {
                game.scene.start("LobbyScene", { x: 960, y: 540, socket: this.socket});
                socket.emit("gameExt", "cancelJoin");
                game.scene.stop("MatchScene");
            }
        });

        returnToLobbyBtn.setInteractive().on('pointerdown', () => {
            if(!this.messageContainer.alpha)
            {
                try { returnToLobbyBtn.destroy(); } catch(e) {}
                game.scene.sendToBack("UIScene");
                game.scene.stop("UIScene");
            }
        });
    }

    updateHealth(args)
    {
        this.healthBar.setAlpha(1);
        if(this.healthBarShadow.width != args[1])
            this.healthBarShadow.displayWidth = args[1];
        
        this.healthRectangle.displayWidth = args[1] / args[2] * args[0];
    }

    killedSomeone(args)
    {
        this.killMenu.setAlpha(1);
        if(Number(this.kills.text) + 1 < 10)
            this.kills.text = "0" + (Number(this.kills.text) + 1);
        else
            this.kills.text = String(Number(this.kills.text) + 1);

        this.sound.play('playerKilled');

        var spaceBetweenContainers = 5;
        var killContainer = this.add.container();
        var killedBg = this.add.graphics();
        killedBg.fillStyle(0x000000, 0.5);
        var killedText = this.add.text(0, 1080, "KILLED ", { fontFamily: 'Rubik', fontSize: '30px', color: "#fff"}).setOrigin(0, 0);
        var killedName = this.add.text(0, 1080, args[0].toUpperCase(), { fontFamily: 'Rubik', fontSize: '30px', color: "#f30000"}).setOrigin(0, 0);
        killedText.x = Math.floor((1920 - (killedText.width + killedName.width + 20)) / 2) + 10;
        killedText.y = this.highestKillBoxY - killedText.height - 10 - spaceBetweenContainers;
        this.highestKillBoxY = killedText.y - spaceBetweenContainers;
        killedName.x = killedText.x + killedText.width;
        killedName.y = killedText.y;
        killedBg.fillRoundedRect(killedText.x - 10, killedText.y - 5, killedText.width + killedName.width + 20, killedText.height + 10, 10);
        killContainer.add(killedBg);
        killContainer.add(killedText);
        killContainer.add(killedName);
        this.killsBoxes.push(killContainer);
        this.time.delayedCall(3000, this.killRectangleFromKillFeed, [killContainer, spaceBetweenContainers], this)
    }

    killRectangleFromKillFeed(killContainer, spaceBetweenContainers)
    {
        var keyToSplice = this.killsBoxes.indexOf(killContainer);
        if(keyToSplice != -1)
            this.killsBoxes.splice(keyToSplice, 1);
        if(!this.killsBoxes.length)
            this.highestKillBoxY = 1055;
        for(var container in this.killsBoxes)
            this.killsBoxes[container].y -= killContainer.height;
        killContainer.destroy();
    }

    updateWeaponHUD(args, fullHUD = true)
    {
        this.weaponMenu.setAlpha(1);
        if(args[0] < 10)
            args[0] = "0" + args[0];
        if(args[1] < 10)
            args[1] = "00" + args[1];
        else if(args[1] < 100)
            args[1] = "0" + args[1];
        this.loadedAmmo.text = args[0];
        this.totalAmmo.text = args[1];
        this.totalAmmo.alpha = 0.6;
        if(fullHUD)
        {
            this.weaponMenuIcons.hopup.setFrame(String(args[4]) + String(args[2]) + ".png");
            this.weaponMenuIcons.mag.setFrame(String(args[4]) + String(args[3]) + ".png");
            this.weaponName.text = args[5];
            this.centerInContainer(this.weaponBg, this.weaponName);
        }
    }

    showOptions(socket)
    {
        if(!this.showingOptions && !this.messageContainer.alpha && !this.loadingShadow.alpha)
        {
            this.showingOptions = true;
            var overlayItems = [];

            var shadow = this.add.rectangle(0, 0, 1920, 1080, "0x000000", 0.6).setOrigin(0, 0);

            var returnToMatchBtn = this.add.sprite(0, 400, 'wideBtn', 'wideBtn0001.png').setOrigin(0, 0);
            this.centerInContainer(this.loadingShadow, returnToMatchBtn);
            var returnToMatchBtnText = this.add.text(0, 410, "Return to Match", { fontFamily: 'Rubik', fontSize: '35px'}).setOrigin(0, 0);
            this.centerInContainer(returnToMatchBtn, returnToMatchBtnText);

            var returnToLobbyBtn = this.add.sprite(0, 500, 'wideBtn', 'wideBtn0001.png').setOrigin(0, 0);
            this.centerInContainer(this.loadingShadow, returnToLobbyBtn);
            var returnToLobbyBtnText = this.add.text(0, 510, "Return to Lobby", { fontFamily: 'Rubik', fontSize: '35px'}).setOrigin(0, 0);
            this.centerInContainer(returnToLobbyBtn, returnToLobbyBtnText);

            var muteMusicBtn = this.add.sprite(0, 600, 'wideBtn', 'wideBtn0001.png').setOrigin(0, 0);
            this.centerInContainer(this.loadingShadow, muteMusicBtn);
            var muteMusicBtnText = this.add.text(0, 610, "Mute Music", { fontFamily: 'Rubik', fontSize: '35px'}).setOrigin(0, 0);
            this.centerInContainer(muteMusicBtn, muteMusicBtnText);

            if(getCookie("music") !== "true")
            {
                muteMusicBtnText.text = "Allow Music";
                this.sound.removeByKey('matchMusic');
            }

            var muteSoundsBtn = this.add.sprite(0, 700, 'wideBtn', 'wideBtn0001.png').setOrigin(0, 0);
            this.centerInContainer(this.loadingShadow, muteSoundsBtn);
            var muteSoundsBtnText = this.add.text(0, 710, "Mute All Sounds", { fontFamily: 'Rubik', fontSize: '35px'}).setOrigin(0, 0);
            this.centerInContainer(muteSoundsBtn, muteSoundsBtnText);

            if(game.sound.mute || gameSoundMuted)
            {
                muteSoundsBtnText.text = "Unmute Sounds";
                this.centerInContainer(muteSoundsBtn, muteSoundsBtnText);
            }

            overlayItems.push(shadow);
            overlayItems.push(returnToMatchBtn);
            overlayItems.push(returnToMatchBtnText);
            overlayItems.push(returnToLobbyBtn);
            overlayItems.push(returnToLobbyBtnText);
            overlayItems.push(muteMusicBtn);
            overlayItems.push(muteMusicBtnText);
            overlayItems.push(muteSoundsBtn);
            overlayItems.push(muteSoundsBtnText);

            for(var i in overlayItems)
                this.children.bringToTop(overlayItems[i]);

            returnToMatchBtn.setInteractive().on('pointerdown', () => {
                if(!this.messageContainer.alpha && !this.loadingShadow.alpha)
                {
                    for(var i in overlayItems)
                    {
                        try { overlayItems[i].destroy() } catch(e) {}
                    }
                    this.showingOptions = false;
                }
            });

            returnToLobbyBtn.setInteractive().on('pointerdown', () => {
                if(!this.messageContainer.alpha && !this.loadingShadow.alpha)
                {
                    for(var i in overlayItems)
                    {
                        try { overlayItems[i].destroy() } catch(e) {}
                    }
                    this.showingOptions = false;
                    this.leaveMatch(socket);
                }
            });

            muteSoundsBtn.setInteractive().on('pointerdown', () => {
                if(!this.messageContainer.alpha && !this.loadingShadow.alpha)
                {
                    muteSoundsBtn.anims.play('wideBtnClicked');
                    if(game.sound.mute || gameSoundMuted)
                    {
                        muteSoundsBtnText.text = "Mute Sounds";
                        game.sound.mute = false;
                        gameSoundMuted = false;
                        this.centerInContainer(muteSoundsBtn, muteSoundsBtnText);
                    }
                    else
                    {
                        muteSoundsBtnText.text = "Unmute Sounds";
                        game.sound.mute = true;
                        gameSoundMuted = true;
                        this.centerInContainer(muteSoundsBtn, muteSoundsBtnText);
                    }
                }
            });

            muteMusicBtn.setInteractive().on('pointerdown', () => {
                if(!this.messageContainer.alpha && !this.loadingShadow.alpha)
                {
                    muteMusicBtn.anims.play('wideBtnClicked');
                    if(getCookie("music") !== "true")
                    {
                        muteMusicBtnText.text = "Mute Music";
                        setCookie("music", "true", 365);
                        if(!game.scene.getScene("MatchScene").waitingForMatch) this.playMatchMusic();
                    }
                    else
                    {
                        this.sound.removeByKey('loadingScreenMusic');
                        this.sound.removeByKey('matchMusic');
                        setCookie("music", "false", 365);
                        muteMusicBtnText.text = "Allow Music";
                    }
                }
            });
        }
    }

    playMusicInMatch()
    {
        if(getCookie("music") === "true")
        {
            this.sound.removeByKey('loadingScreenMusic');
            this.sound.play('loadingScreenMusic', {volume: 0.3});
        }
    }

    playMatchMusic()
    {
        if(getCookie("music") === "true")
        {
            this.sound.removeByKey('matchMusic');
            this.matchMusic = this.sound.play('matchMusic', {volume: 0.1, loop: true});
        }
    }

    leaveMatch(socket)
    {
        this.sound.removeByKey('loadingScreenMusic');
        this.sound.removeByKey('matchMusic');
        game.scene.start("LobbyScene", { x: 960, y: 540, socket: this.socket});
        socket.emit("gameExt", "cancelJoin");
        game.scene.stop("MatchScene");
        game.scene.sendToBack("UIScene");
        game.scene.stop("UIScene");
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