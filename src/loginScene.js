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
        this.loginText;
    }

    preload() 
    {

        this.loadingPercentage = this.add.text(860, 830, "Loading: ", {fontFamily: 'Roboto', fontSize: '32px', fill: '#FFF'});
        //Game assets
        this.load.image('loginbg', 'assets/loginbg.png');
        this.load.image('loginlogo', 'assets/loginlogo.png');
        this.load.multiatlas('formFields', 'assets/forms/fields.json', 'assets/forms');
        //Plugins
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'js/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        this.load.plugin('rextexteditplugin', 'js/rextexteditplugin.min.js', true);

        //if loading becomes too much, balancing may be done with another loading part after login completes

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
        game.scene.remove("BootScene");
        this.loadingPercentage.destroy();
    }
    
    create()
    {
        this.add.image(960, 540, 'loginbg');
        this.loginLogo = this.add.sprite(960, 100, 'loginlogo');
        this.loginLogo.alpha = 0;

        this.loginText = this.add.text(945, 370, "Login:", { fontFamily: 'Montserrat', fontSize: '64px'});
        this.loginText.setOrigin(0.5, 0.5);
        this.loginText.alpha = 0;

        this.usernameFieldAsset = this.add.sprite(960, 480, 'formFields', 'field0001.png');
        this.usernameFieldAsset.alpha = 0;

        this.usernameField = this.add.text(950, 480, "Username", { fontFamily: 'Roboto', fontSize: '48px', fixedWidth: 700, color: "#ABABAB"});
        this.usernameField.setOrigin(0.5, 0.5);
        this.usernameField.alpha = 0;

        var onCloseUsernameEditor = function (txtObj)
        {
            txtObj.style.color = "rgb(171 171 171)";
            if(txtObj.text == "") txtObj.text = "Username";
            this.scene.usernameFieldAsset.setFrame("field0001.png");
        };

	    this.usernameField.setInteractive().on('pointerdown', () => {
            this.usernameFieldAsset.setFrame("field0002.png");
            if(this.usernameField.text == "Username") this.usernameField.text = "";
            this.usernameField.style.color = "rgb(0 0 0)";
            this.usernameEditor = this.rexUI.edit(this.usernameField, {}, onCloseUsernameEditor);
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
        else if(this.loginElementsAlpha >= 2 && this.loginElementsAlpha < 3)
        {
            this.usernameFieldAsset.alpha += delta / 300;
            this.usernameField.alpha += delta / 300;
            this.loginElementsAlpha += delta / 300;
        }
    }
}