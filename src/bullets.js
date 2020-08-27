class Bullet extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y, bulletsKey)
    {
        super(scene, x, y, 'bulletsKey');
    }

    fire (x, y)
    {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityY(-300);
    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (this.y <= -32)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class Bullets extends Phaser.Physics.Arcade.Group
{
    constructor (scene, bulletsKey, maxBullets)
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: maxBullets,
            key: bulletsKey,
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    fireBullet (x, y)
    {
        var bullet = this.getFirstDead(false);

        if (bullet)
        {
            bullet.fire(x, y);
        }
    }
}