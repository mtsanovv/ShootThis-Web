<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<title>ShootThis - a 2D HTML5 online shooter</title>
		<link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700|Material+Icons|Kaushan+Script|Rubik|Montserrat">
		<link rel="stylesheet" href="https://unpkg.com/bootstrap-material-design@4.1.1/dist/css/bootstrap-material-design.min.css" integrity="sha384-wXznGJNEXNG1NFsbm0ugrLFMQPWswR3lds2VeinahP8N0zJw9VWSopbjv2x7WCvX" crossorigin="anonymous">
		<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.10/cookieconsent.min.js"></script>
		<script type="text/javascript">
			window.cookieconsent_options = {"message":"This website uses cookies to improve your experience.","dismiss":"Got It","learnMore":"Learn More","link":"https://cookie-consent.app.forthe.top/why-websites-use-cookies/","target": "_blank", "theme":"light-bottom"};
		</script>
		<script src="https://cdn.jsdelivr.net/npm/phaser@3.23.0/dist/phaser.min.js"></script>
		<!--Alternative location for Phaser 3.23.0 -> js/phaser.min.js-->
	</head>
	<body style="background-image: url('images/background.png'); color: #ffffff;">
		<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
		<script src="https://unpkg.com/popper.js@1.12.6/dist/umd/popper.js" integrity="sha384-fA23ZRQ3G/J53mElWqVJEGJzU0sTs+SvzG8fXVWP+kJQ1lwFAOkcUOysnlKJC33U" crossorigin="anonymous"></script>
		<script src="https://unpkg.com/bootstrap-material-design@4.1.1/dist/js/bootstrap-material-design.js" integrity="sha384-CauSuKpEqAFajSpkdjv3z9t8E7RlpJ1UP0lKM/+NdtSarroVKu069AlsRPKkFBz9" crossorigin="anonymous"></script>
		<script>$(document).ready(function() { $('body').bootstrapMaterialDesign(); });</script>
		<nav class="navbar navbar-expand-lg navbar-dark" style="background-color: rgba(255,255,255, 0.1); box-shadow: none !important; border-bottom: 1px solid rgba(255, 255, 255, 0.7) !important;">
		  <div class="navbar-brand" style="font-family: 'Kaushan Script' !important;" >ShootThis</div>
		  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		  </button>
		  <div class="collapse navbar-collapse" id="navbarNavDropdown">
			<ul class="ml-auto navbar-nav">
			  <li class="nav-item">
				<a class="nav-link" href="index.html">Home</a>
			  </li>
			  <li class="nav-item">
				<a class="nav-link" href="register.php">Register</a>
			  </li>
			  <li class="nav-item">
				<a class="nav-link active" href="#">Play Now! <span class="sr-only">(current)</span></a>
			  </li>
			</ul>
		  </div>
		</nav>
		
		<center>
			<?php
				error_reporting(0);
				require_once 'Mobile_Detect.php';
				$detect = new Mobile_Detect;
				if($detect->isMobile() || $detect->isTablet())
				{
					echo '<h1 style="margin-top: 3vh; font-weight: 100; margin-right: 2vw; margin-left: 2vw;" ><span style="font-family: \'Kaushan Script\' !important;">ShootThis</span> is only available for desktop devices.</h1>';
					die();
				}
			?>
			
		</center>
		<script src="config.js" type="text/javascript"></script>
		<script src="js/socket.io.js" type="text/javascript"></script>
		<script src="js/util.js" type="text/javascript"></script>
		<script src="src/matchScene.js" type="text/javascript"></script>
		<script src="src/lobbyScene.js" type="text/javascript"></script>
		<script src="src/serversScene.js" type="text/javascript"></script>
		<script src="src/loginScene.js" type="text/javascript"></script>
		<script src="src/loaderScene.js" type="text/javascript"></script>
		<script src="src/init.js" type="text/javascript"></script>
		<div id="game" style="margin-top: 2vh;">
		</div>

	</body>
</html>
