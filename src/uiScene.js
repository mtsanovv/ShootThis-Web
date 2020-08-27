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
    }

    create(data)
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

        this.weaponMenu = this.add.container();
        this.weaponBg = this.add.image(1700, 860, "matchUIWeapon").setOrigin(0, 0);
        this.loadedAmmo = this.add.text(1760, 865, "09", { fontFamily: 'Rubik', fontSize: '60px', color: "#fff", fontStyle: "bold", align: 'right'}).setOrigin(0, 0);
        this.totalAmmo = this.add.text(1745, 932, "000", { fontFamily: 'Rubik', fontSize: '60px', color: "#fff", fontStyle: "bold", align: 'right'}).setOrigin(0, 0);
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
        this.weaponMenu.alpha = 0;

        this.children.bringToTop(this.loadingShadow);
    }

    updateWeaponHUD(args)
    {
        this.weaponMenu.alpha = 1;
        if(args[0] < 10)
            args[0] = "0" + args[0];
        if(args[1] < 10)
            args[1] = "00" + args[1];
        else if(args[1] < 100)
            args[1] = "0" + args[1];
        this.loadedAmmo.text = args[0];
        this.totalAmmo.text = args[1];
        this.weaponMenuIcons.hopup.setFrame(String(args[4]) + String(args[2]) + ".png");
        this.weaponMenuIcons.mag.setFrame(String(args[4]) + String(args[3]) + ".png");
        this.weaponName.text = args[5];
        this.centerInContainer(this.weaponBg, this.weaponName);
    }

    showOptions(socket)
    {
        if(!this.showingOptions && !this.messageContainer.alpha)
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

            var muteSoundsBtn = this.add.sprite(0, 600, 'wideBtn', 'wideBtn0001.png').setOrigin(0, 0);
            this.centerInContainer(this.loadingShadow, muteSoundsBtn);
            var muteSoundsBtnText = this.add.text(0, 610, "Mute Sounds", { fontFamily: 'Rubik', fontSize: '35px'}).setOrigin(0, 0);
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
            overlayItems.push(muteSoundsBtn);
            overlayItems.push(muteSoundsBtnText);

            for(var i in overlayItems)
                this.children.bringToTop(overlayItems[i]);

            returnToMatchBtn.setInteractive().on('pointerdown', () => {
                if(!this.messageContainer.alpha)
                {
                    for(var i in overlayItems)
                    {
                        try { overlayItems[i].destroy() } catch(e) {}
                    }
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
                    this.showingOptions = false;
                    this.leaveMatch(socket);
                }
            });

            muteSoundsBtn.setInteractive().on('pointerdown', () => {
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
            });
        }
    }

    leaveMatch(socket)
    {
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