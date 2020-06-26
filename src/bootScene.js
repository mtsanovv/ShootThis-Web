class BootScene extends Phaser.Scene
{

    constructor (config)
    {
        super(config);
        this.loadingText;
        this.goingForward = true;
    }

    preload ()
    {
        this.load.multiatlas('loadingScreen', 'assets/loading/loading.json', 'assets/loading');
    }

    create(data)
    {
        this.loadingText = this.add.sprite(0, 479, 'loadingScreen', 'loading/loading0001.png');

        var frameNames = this.anims.generateFrameNames('loadingScreen', {
            start: 1, end: 45, zeroPad: 4,
            prefix: 'loading', suffix: '.png'
        });

        this.anims.create({ key: 'moveLogo', frames: frameNames, frameRate: 24, repeat: -1 });
        this.loadingText.anims.play('moveLogo');

        game.scene.add("LoginScene", LoginScene, true, { x: 960, y: 540});
    }

    update(time, delta)
    {
        if(this.goingForward)
        {
            if(this.loadingText.x < 1478)
                this.loadingText.x += delta / 1.33;
            else 
                this.goingForward = false;
        }
        else
        {
            if(this.loadingText.x > 0)
                this.loadingText.x -= delta / 1.33;
            else
                this.goingForward = true;
        }
    }
}