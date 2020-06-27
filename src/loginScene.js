class LoginScene extends Phaser.Scene
{

    constructor (config)
    {
        super(config);
        this.loadingPercentage;
    }

    preload() 
    {

        this.loadingPercentage = this.add.text(860, 830, "Loading: ", {fontFamily: 'Roboto', fontSize: '32px', fill: '#FFF'});
        //all game assets are added here
        this.load.image('loginbg', 'assets/loginbg.png');
        //if it becomes too much, balancing may be done with another loading part after login completes

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
    }
}