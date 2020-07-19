class ServersScene extends Phaser.Scene
{

    constructor (config)
    {
        super(config);
        this.loginLogo;
        this.loginText;
        this.availableServers;
        this.loginElementsAlpha = -0.5;
        this.serverAssets = [];
        this.serverTextAssets = [];
    }
   
    //this screen can only show up to 24 servers, so be careful!

    create(data)
    {
        this.availableServers = data.availableServers;

        this.add.image(960, 540, 'loginbg');
        this.loginLogo = this.add.sprite(960, 100, 'loginlogo');
        this.loginLogo.alpha = 0;

        this.loginText = this.add.text(945, 280, "Please select a server:", { fontFamily: 'Rubik', fontSize: '64px'});
        this.loginText.setOrigin(0.5, 0.5);
        this.loginText.alpha = 0;

        var wideBtnClicked = this.anims.generateFrameNames('wideBtn', {
            start: 2, end: 14, zeroPad: 4,
            prefix: 'wideBtn', suffix: '.png'
        });

        this.anims.create({ key: 'wideBtnClicked', frames: wideBtnClicked, frameRate: 24});

        var serversAdded = 0;

        for(var j = 0; j < 8; j++)
        {
            for(var i = 0; i < 3; i++)
            {
                if(serversAdded < this.availableServers.length)
                {
                    var img = this.add.sprite(i * 640, j * 83 + 350, 'wideBtn', 'wideBtn0001.png');
                    img.alpha = 0;
                    img.setOrigin(0, 0);
                    var txt = this.add.text(i * 640 + 45, j * 83 + 360, this.availableServers[i + 3 * j][2] + " (" + this.availableServers[i + 3 * j][1] + "ms)", { fontFamily: 'Rubik', fontSize: '32px'});
                    txt.x = i * 640 + Math.floor((img.width - txt.width) / 2);
                    txt.alpha = 0;
                    txt.setOrigin(0, 0);
                    serversAdded++;
                    this.serverAssets.push(img);
                    this.serverTextAssets.push(txt);
                }
            }
        }

        var serverList = this.add.group(this.serverAssets);

        this.input.setHitArea(serverList.getChildren()).on('gameobjectdown', function(pointer, gameObject) {
            gameObject.anims.play('wideBtnClicked');
            setCookie("gameServer",  this.scene.availableServers[gameObject.x / 640 + 3 * (gameObject.y - 350) / 83][0], 0.00694);
            game.scene.add("LobbyScene", LobbyScene, true, { x: 960, y: 540, socket: false});
            game.scene.remove("ServersScene");
        });
    }

    update(time, delta)
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
        else if(this.loginElementsAlpha >= 2 && this.loginElementsAlpha < Math.ceil(this.serverAssets.length / 3) + 2)
        {
            try
            {
                this.serverAssets[(Math.floor(this.loginElementsAlpha) - 2) * 3].alpha += delta / 300;
                this.serverTextAssets[(Math.floor(this.loginElementsAlpha) - 2) * 3].alpha += delta / 300;
                this.serverAssets[(Math.floor(this.loginElementsAlpha) - 2) * 3 + 1].alpha += delta / 300;
                this.serverTextAssets[(Math.floor(this.loginElementsAlpha) - 2) * 3 + 1].alpha += delta / 300;
                this.serverAssets[(Math.floor(this.loginElementsAlpha) - 2) * 3 + 2].alpha += delta / 300;
                this.serverTextAssets[(Math.floor(this.loginElementsAlpha) - 2) * 3 + 2].alpha += delta / 300;
            }
            catch(e) {}

            this.loginElementsAlpha += delta / 300;
        }
    }
}