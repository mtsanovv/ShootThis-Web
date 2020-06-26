var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: "game",
    scale: {
        parent: 'game',
        mode: Phaser.Scale.FIT,
        width: 1920,
        height: 1080,
        max: {
            width: 1920,
            height: 1080
        },
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('loginBg', 'assets/loginBg.png');
}

function create ()
{
    this.add.image(960, 540, 'loginBg');

}