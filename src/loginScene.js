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
    }

    preload() 
    {

        this.loadingPercentage = this.add.text(860, 830, "Loading: ", {fontFamily: 'Roboto', fontSize: '32px', fill: '#FFF'});
        //Login scene assets
        this.load.image('loginbg', 'assets/loginbg.png');
        this.load.image('loginlogo', 'assets/loginlogo.png');
        this.load.multiatlas('formFields', 'assets/forms/fields.json', 'assets/forms');
        this.load.multiatlas('rememberAccount', 'assets/forms/checkbox.json', 'assets/forms');
        this.load.multiatlas('loginBtn', 'assets/forms/mediumBtn.json', 'assets/forms');
        //Login plugins
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
        game.scene.remove("LoaderScene");
        this.loadingPercentage.destroy();
    }
    
    create()
    {
        this.add.image(960, 540, 'loginbg');
        this.loginLogo = this.add.sprite(960, 100, 'loginlogo');
        this.loginLogo.alpha = 0;

        this.usernameFieldAsset = this.add.sprite(960, 480, 'formFields', 'field0001.png');
        this.usernameFieldAsset.alpha = 0;

        this.usernameField = this.add.text(950, 480, "Username", { fontFamily: 'Roboto', fontSize: '48px', fixedWidth: 700, color: "#ABABAB"});
        this.usernameField.setOrigin(0.5, 0.5);
        this.usernameField.alpha = 0;

        var onCloseUsernameEditor = function (txtObj)
        {
            txtObj.style.color = "rgb(171 171 171)";
            this.username = txtObj.text;
            if(txtObj.text == "") 
                txtObj.text = "Username";
            this.scene.usernameFieldAsset.setFrame("field0001.png");
        };

	    this.usernameField.setInteractive().on('pointerdown', () => {
            this.usernameFieldAsset.setFrame("field0002.png");
            if(this.usernameField.text == "Username") 
                this.usernameField.text = "";
            this.usernameField.style.color = "rgb(0 0 0)";
            this.usernameEditor = this.rexUI.edit(this.usernameField, {}, onCloseUsernameEditor);
        });

        this.passwordFieldAsset = this.add.sprite(960, 570, 'formFields', 'field0001.png');
        this.passwordFieldAsset.alpha = 0;

        this.passwordField = this.add.text(950, 570, "Password", { fontFamily: 'Roboto', fontSize: '48px', fixedWidth: 700, color: "#ABABAB"});
        this.passwordField.setOrigin(0.5, 0.5);
        this.passwordField.alpha = 0;

        var onClosePasswordEditor = function (txtObj)
        {
            txtObj.style.color = "rgb(171 171 171)";
            this.password = txtObj.text;
            if(txtObj.text == "") 
                txtObj.text = "Password";
            else
            {
                txtObj.style.color = "rgb(0 0 0)";
                for(var c in txtObj.text)
                    txtObj.text = txtObj.text.substr(0, c) + '●' + txtObj.text.substr(c + 1);
            }
            this.scene.passwordFieldAsset.setFrame("field0001.png");
        };

	    this.passwordField.setInteractive().on('pointerdown', () => {
            this.passwordFieldAsset.setFrame("field0002.png");
            if(this.passwordField.text == "Password") this.passwordField.text = "";
            this.passwordField.style.color = "rgb(0 0 0)";
            this.passwordEditor = this.rexUI.edit(this.passwordField, {type: "password"}, onClosePasswordEditor);
        });

        this.rememberAccount = this.add.sprite(960, 650, 'rememberAccount', 'checkbox0001.png');
        this.rememberAccount.alpha = 0;

        var checkboxClicked = this.anims.generateFrameNames('rememberAccount', {
            start: 9, end: 20, zeroPad: 4,
            prefix: 'checkbox', suffix: '.png'
        });

        this.anims.create({ key: 'checkboxClicked', frames: checkboxClicked, frameRate: 24});

        this.rememberAccount.setInteractive().on('pointerdown', () => {
            if(this.rememberAccount.frame.name == "checkbox0001.png")
            {
                this.rememberAccount.anims.play('checkboxClicked');
                this.saveAccount = true;
            }
            else
            {
                this.rememberAccount.setFrame("checkbox0001.png");
                this.saveAccount = false;
            }
        });

        this.loginBtn = this.add.sprite(960, 800, 'loginBtn', 'mediumBtn0001.png');
        this.loginBtn.alpha = 0;

        this.loginBtnText = this.add.text(960, 780, "Login", { fontFamily: 'Montserrat', fontSize: '64px'});
        this.loginBtnText.setOrigin(0.5, 0.5);
        this.loginBtnText.alpha = 0;

        var loginBtnClicked = this.anims.generateFrameNames('loginBtn', {
            start: 2, end: 14, zeroPad: 4,
            prefix: 'mediumBtn', suffix: '.png'
        });

        this.anims.create({ key: 'loginBtnClicked', frames: loginBtnClicked, frameRate: 24});

        this.loginBtn.setInteractive().on('pointerdown', () => {
            this.loginBtn.anims.play('loginBtnClicked');
            //initiate login sequence
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
}