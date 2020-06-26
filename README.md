# ShootThis-Web

A 2D HTML5 shooter, using the [Phaser 3](https://github.com/photonstorm/phaser/) engine.

**Please note that this is the Web version and it requires a backend to operate. Please refer to [ShootThis-Backend](https://github.com/mtsanovv/ShootThis-Backend).**
## Instructions
1. You can clone this repository or download a ZIP. 
2. This project was based on php-fpm 7.1.33. Some parts of it may break down when newer or older versions are used.
3. As soon as you put this project onto your web server it should work perfectly fine for the most part. You may have to configure some parameters (i.e. database details and recaptcha keys) in the file register.php.
4. The mail verfication script may not work when it's requested from a location that's behind proxy/CDN and thus break down the register.php file. You may want to configure your web server to serve that script directly. **When you do so, you need to configure $mailValidatorHost, by default it is $_SERVER['HTTP_HOST']. The mail validator script could have some unexpected behavior when requested using https protocol, so http may only be used. Since that's an inside page, it's perfectly fine.**

## About the SQL file included
This is the structure of the database that is used for ShootThis **and it is required by both the frontend and the backend.**

## Authors
- Web Design: M. Tsanov
- Game Design: S. Tsvetkov
- Graphics Design: M. Tsanov, S. Tsvetkov
- Backend: M. Tsanov, Y. Berov

## Credits
- Mail verification script: Konstantin Granin [<kostya@granin.me>](mailto:kostya@granin.me)
- Phaser 3 engine: [https://github.com/photonstorm/phaser/] (https://github.com/photonstorm/phaser/)

*M. Tsanov, S. Tsvetkov, Y. Berov, 2020*
