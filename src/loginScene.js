class LoginScene extends Phaser.Scene
{

    constructor (config)
    {
        super(config);
        this.loadingPercentage;
    }

    preload() 
    {

        var loadingPercentage = this.add.text(860, 830, "Loading: ", {fontFamily: 'Roboto', fontSize: '32px', fill: '#FFF'});
        //login scene stuff is added here
        this.load.image('loginbg', 'assets/loginbg.png');
        //end login scene asssets

		this.load.on('progress', this.onProgress, {loadingPercentage:loadingPercentage});
		this.load.on('complete', this.onComplete, {scene:this.scene});
	}

    onProgress(percentage) 
    {
		percentage = percentage * 100;
        this.loadingPercentage.setText("Loading: " + percentage.toFixed(0) + "%");
	}

    onComplete() 
    {
		game.scene.remove("BootScene");
    }
    
    create()
    {
        this.add.image(960, 540, 'loginbg');
    }
}