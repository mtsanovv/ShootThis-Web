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

        this.children.bringToTop(this.loadingShadow);
    }

    showOptions(socket)
    {
        if(!this.showingOptions && !this.messageContainer.alpha)
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
                    game.scene.sendToBack("UIScene");
                    game.scene.sleep("UIScene");
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



    leaveMatch(socket)
    {
        game.scene.start("LobbyScene", { x: 960, y: 540, socket: this.socket});
        socket.emit("gameExt", "cancelJoin");
        game.scene.stop("MatchScene");
        game.scene.stop("UIScene");
    }

    showMessage(title, message, yesno = "none", yesCallback = () => {this.messageYesBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0; game.scene.sendToBack("UIScene"); game.scene.sleep("UIScene"); }, noCallback = () => {this.messageNoBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0; game.scene.sendToBack("UIScene"); game.scene.sleep("UIScene"); }, okCallback = () => {this.messageOkBtn.anims.play('loginBtnClicked'); this.messageContainer.alpha = 0; game.scene.sendToBack("UIScene"); game.scene.sleep("UIScene"); })
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