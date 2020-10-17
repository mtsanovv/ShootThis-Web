# ShootThis-Web

A 2D HTML5 battle royale, using the [Phaser 3](https://github.com/photonstorm/phaser/) engine.

**Please note that this is the Web version and it requires a backend to operate. Please refer to [ShootThis-Backend](https://github.com/mtsanovv/ShootThis-Backend).**

**The external tools besides the image, code and audio editing software used in the creation process are located in [ShootThis-Tools](https://github.com/mtsanovv/ShootThis-Tools).**

## Demos

- Trailer: https://www.youtube.com/watch?v=CnBwuOsRmqI
- Gameplay: https://www.youtube.com/watch?v=5GN0ucv-P44

## Instructions
1. You can clone this repository or download a ZIP. 
2. This project was based on PHP 7.1.33. Some parts of it may break down when newer or older versions are used. For testing purposes, if you cannot setup a MySQL/MariaDB server and/or a web server, use [XAMPP](https://www.apachefriends.org/download.html). We have used it to test the game on our personal Windows PCs, for the playtests we used an Ubuntu server and installed manually mysql-server and nginx.
3. You may have to configure some parameters (i.e. database details and recaptcha keys) in the file register.php.
4. The mail verfication script may not work when it's requested from a location that's behind proxy/CDN and thus break down the register.php file. You may want to configure your web server to serve that script directly. **When you do so, you need to configure $mailValidatorHost in register.php, by default it is $_SERVER['HTTP_HOST']. The mail validator script could have some unexpected behavior when requested using https protocol, so http may only be used. Since that's an inside page (make sure the address cannot be guessed by anyone), it's perfectly fine.**
5. In order for the registration script to work, you need to create a new database using the shootthis.sql file in your SQL server. **Please note that this file was created by MariaDB. This has not been tested with other engines and it may not work with some.**
6. You may have to edit the config.js file to match the backend login server(s) address and port, as well as the security protocol. If you use https as security protocol, you may need to configure on your servers SSL access for the respective ports. 
```diff 
- By default, this uses http, which is EXTREMELY insecure BECAUSE PASSWORDS ARE SENT IN PLAINTEXT. ALWAYS USE HTTPS WHENEVER SENDING PLAINTEXT PASSWORDS!
```

**For using secure (https) connections for the ShootThis-Backend servers, please refer to the [SSL configuration for ShootThis-Backend servers](https://github.com/mtsanovv/ShootThis-Backend/blob/master/README-SSL.md)**.

7. In order to have everything operational, you need to set up the backend, following the instructions. [ShootThis-Backend](https://github.com/mtsanovv/ShootThis-Backend)
8. **There is the chance of having bruteforce attempts on login. Thus, you need to set up a firewall filtering packets on login and game server as well.**

## Important notes
- The SQL file included contains the structure of the database that is used for ShootThis **and it is required by both the frontend and the backend.**

## Authors
- Web Design: M. Tsanov
- Game Design: S. Tsvetkov
- Artwork: M. Tsanov, S. Tsvetkov
- Backend: M. Tsanov, Y. Berov

## Credits
- Mail verification script: Konstantin Granin <kostya@granin.me>
- Mobile device detection: http://mobiledetect.net/

*M. Tsanov, S. Tsvetkov, Y. Berov, 2020*
