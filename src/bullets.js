class Bullet extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y)
    {
        super(scene, x, y, 'bullet');
        this.playerId = -1;
        this.timeFired = 0;
        this.bulletTravelTime = 0;
        this.bulletTravelDistance = 0;
        this.bulletSpeed = 0;
        this.maxX = 0;
        this.maxY = 0;
        this.damage = 0;
    }

    fire (args)
    {
        this.playerId = args[0];
        this.timeFired = args[1];
        this.bulletTravelTime = args[2];
        this.bulletTravelDistance = args[3];
        this.bulletSpeed = this.bulletTravelDistance / this.bulletTravelTime; //pixels per ms
        this.damage = args[7];

        var x = args[4];
        var y = args[5];
        this.rotation = args[6];
        this.maxX = x + this.bulletTravelDistance * Math.cos(this.rotation);
        this.maxY = y + this.bulletTravelDistance * Math.sin(this.rotation);

        this.setOrigin(0, 0.5);

        this.body.reset(x, y);

        this.toggleBullet(true);
    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        this.x += delta * this.bulletSpeed * Math.cos(this.rotation);
        this.y += delta * this.bulletSpeed * Math.sin(this.rotation);

        var xEvaluated = Math.cos(this.rotation) < 0 ? this.x < this.maxX : this.x > this.maxX;
        var yEvaluated = Math.sin(this.rotation) < 0 ? this.y < this.maxY : this.y > this.maxY; 

        if (xEvaluated && yEvaluated)
            this.toggleBullet(false);
    }

    toggleBullet(toggle, tint = false, type = "none", player = null)
    {
        if(toggle)
        {
            this.setActive(true);
            this.setVisible(true);
            this.body.enable = true;
        }
        else
        {
            this.setActive(false);
            this.setVisible(false);
            this.body.enable = false;
            this.scene.bulletDied(this, tint, type, player);
        }
    }
}

class Bullets extends Phaser.Physics.Arcade.Group
{
    constructor (scene, maxBullets)
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: maxBullets,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    fireBullet (args)
    {
        var bullet = this.getFirstDead(false);

        if (bullet)
            bullet.fire(args);
    }
}