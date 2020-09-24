<?php

	error_reporting(0);

	//bannedEmails.txt is used to ban specific email addresses
	//bannedDomains.txt is used to ban specific domain names

	$success = false;
	$usernameCheck = true;
	$error = array();

	$_SERVER['REMOTE_ADDR'] = isset($_SERVER["HTTP_CF_CONNECTING_IP"]) ? $_SERVER["HTTP_CF_CONNECTING_IP"] : $_SERVER["REMOTE_ADDR"];

	$dbUser = "root"; //database username
	$dbPass = ""; //database password
	$dbName = "shootthis"; //database name
	$dbHost = "localhost"; //database host
	//only v2 recaptcha supported
	//the current recaptcha keys used are the ones provided by Google for testing purposes
	$recaptchaSecret = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; //Google Recaptcha Secret Key, enter a key to enable captcha
	$recaptchaPublic = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; //Google Recaptcha Public Key, enter a key to enable captcha on this page
	$tempMailKey = ""; //isTempMail.com key, enter a key to use the service to check if users use temp mail addresses
	$mailValidatorHost = "http://" . $_SERVER['HTTP_HOST'] . "/shootthis/"; //host where the mail validation script is located, you can set this to an empty string in order to ignore validation
	//this is not taking in mind the rest of the path: mailVerifier/validate.php, please check below if you need that edited

	if($tempMailKey) include("istempmail.php");

	function printErrors ($errors) 
	{
		foreach ($errors as $err)
			echo '<li>' . $err . '</li>';
	}

	function checkTor()
	{
		$hostname = gethostbyaddr($_SERVER['REMOTE_ADDR']);
		$tor = stripos($hostname, 'tor');

		if($tor == true)
			return true;
		return false;
	}

	function bannedDomain($tempMailKey)
	{
		$domains = file_get_contents('bannedDomains.txt');
		$domainArr = preg_split("/\r\n|\n|\r/", $domains);
		$domain = array_pop(explode("@", $_POST['email']));
		if(in_array($domain, $domainArr))
			return true;
		if(!$tempMailKey)
			return false;
		$isTempMail = new IsTempMail($tempMailKey);
		try 
		{
			if($isTempMail->isDea("testit@" . $domain))
				return true;
		} 
		catch (Exception $exception) {}
		return false;
	}

	function bannedMail()
	{
		$mails = file_get_contents('bannedEmails.txt');
		$mailsarr = preg_split("/\r\n|\n|\r/", $mails);
		if(in_array($_POST['email'], $mailsarr))
			return true;
		return false;
	}

	if ($_SERVER['REQUEST_METHOD'] == 'POST')
	{
		$username = htmlspecialchars($_POST['username']);
		$password = htmlspecialchars($_POST['password']);
		$repeatPassword = htmlspecialchars($_POST['repeatpassword']);
		$email = htmlspecialchars($_POST['email']);

		try 
		{
			$db = new PDO('mysql:host=' . $dbHost . ';dbname=' . $dbName . ';charset=utf8', $dbUser, $dbPass);
			$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

			if (empty($username)) 
			{
				$error[] = '<font size="4" color="red">You did not enter a username.</font>';
				$usernameCheck = false;
			}
			if (!preg_match('/^[A-Za-z0-9]+$/', $username)) 
				$error[] = '<font size="4" color="red">Usernames can only contain letters and numbers.</font>';
			if (!(strlen(trim($username)) > 3))
				$error[] = '<font size="4" color="red">Username must be at least 4 characters long.</font>';
			if (empty($password))
				$error[] = '<font size="4" color="red">You did not enter a password.</font>';
			if (!preg_match('/^[A-Za-z0-9]+$/', $password))
				$error[] = '<font size="4" color="red">Passwords can contain only letters and numbers.</font>';
			if (strlen(trim($password)) < 7 && strlen(trim($password)) > 18)
				$error[] = '<font size="4" color="red">Passwords may be only between 7 and 18 characters long.</font>';
			if ($password != $repeatPassword)
				$error[] = '<font size="4" color="red">Password and password repeat did not match.</font>';
			if (empty($email))
				$error[] = '<font size="4" color="red">You did not enter an email address.</font>';
			if (bannedDomain($tempMailKey) || bannedMail())
				$error[] = '<font size="4" color="red">You cannot use this email to register a ShootThis account.</font>';
			if (checkTor())
				$error[] = '<font size="4" color="red">You are not allowed to register this account.</font>';

			if($usernameCheck)
			{
				$ip = $_SERVER['REMOTE_ADDR'];
				if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4))
					$ip = "::ffff:" . $ip;
				
				$isUsernameAlreadyTaken = $db->prepare("SELECT * FROM users WHERE username LIKE :username");
				$isUsernameAlreadyTaken->bindValue(":username", $_POST['username']);
				$isUsernameAlreadyTaken->execute();
				
				$numusernames = $isUsernameAlreadyTaken->rowCount();
				$isUsernameAlreadyTaken->closeCursor();
				if($numusernames > 0)
				{
					$error[] = '<font size="4" color="red">This username is already taken.</font>';
				}
				$IPCheck = $db->prepare("SELECT * FROM users WHERE `ip` = :ip");
				$IPCheck->bindValue(":ip", $_SERVER["REMOTE_ADDR"]);
				$IPCheck->execute();
				
				$numips = $IPCheck->rowCount();
				$IPCheck->closeCursor();
				if($numips > 3)
					$error[] = '<font size="4" color="red">You cannot register more than 4 accounts.</font>';

				$emailCheck = $db->prepare("SELECT * FROM users WHERE `email` LIKE :email");
				$emailCheck->bindValue(":email", $email);
				$emailCheck->execute();
				
				$numMails = $emailCheck->rowCount();
				$emailCheck->closeCursor();
				if($numMails >= 3)
					$error[] = '<font size="4" color="red">You cannot use this email again to register an account.</font>';
			}
			
			if(isset($_POST['g-recaptcha-response']) && !empty($_POST['g-recaptcha-response']) && $recaptchaPublic && $recaptchaSecret)
			{
				$verifyResponse = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret='. $recaptchaSecret .'&response=' . $_POST['g-recaptcha-response']);
				$responseData = json_decode($verifyResponse);
			}

			if(!$responseData->success && $recaptchaPublic && $recaptchaSecret)
				$error[] = '<font size="4" color="red">Please verify the captcha check.</font>';

			if(!filter_var($email, FILTER_VALIDATE_EMAIL))
				$error[] = '<font size="4" color="red">You did not enter a valid email address.</font>';

			else if($mailValidatorHost)
			{
				$emailValid = file_get_contents($mailValidatorHost . "mailVerifier/validate.php?email=" . $email);
				if($emailValid == "valid")
					$error[] = '<font size="4" color="red">You did not enter a real email address.</font>';
			}

			if(empty($error)) 
			{
				$playerData = '{"level": 1, "character": 0, "xp": 0, "kills": 0, "deaths": 0, "totalGames": 0, "lastMatchKills": 0, "lastMatchXp": 0, "lastMatchDamageDone": 0, "lastMatchTimeElapsed": 0, "lastMatchPlacement": "0/0"}';
				
				$insertQuery = $db->prepare("
					INSERT INTO
						users
						(id, username, nickname, password, email, ipfromreg, ip, playerData, savedLoginCookie, loginToken)
					VALUES
						(:id, :username, :username, :password, :email, :ip, :ip, :playerData, '', '')
				");
				$insertQuery->bindValue(":id", NULL);
				$insertQuery->bindValue(":username", $username);
				$insertQuery->bindValue(":email", $email);
				$insertQuery->bindValue(":password", password_hash($password, PASSWORD_BCRYPT));
				$insertQuery->bindValue(":ip", $ip);
				$insertQuery->bindValue(":playerData", $playerData);
				$insertQuery->execute();
				$insertQuery->closeCursor();
				$success = true;	
			}
		} 
		catch (PDOException $e) 
		{
			//there has been an error with pdo, please check configuration
			$error[] = '<font size="4" color="red">We are currently unable to register your account due to a PDO error. Please contact the site owner.</font>';
		}
	}
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<title>Register | ShootThis - a 2D HTML5 battle royale</title>
		<link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700|Material+Icons|Kaushan+Script">
		<link rel="stylesheet" href="https://unpkg.com/bootstrap-material-design@4.1.1/dist/css/bootstrap-material-design.min.css" integrity="sha384-wXznGJNEXNG1NFsbm0ugrLFMQPWswR3lds2VeinahP8N0zJw9VWSopbjv2x7WCvX" crossorigin="anonymous">
		<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.10/cookieconsent.min.js"></script>
		<script type="text/javascript">
			window.cookieconsent_options = {"message":"This website uses cookies to improve your experience.","dismiss":"Got It","learnMore":"Learn More","link":"https://cookie-consent.app.forthe.top/why-websites-use-cookies/","target": "_blank", "theme":"light-bottom"};
		</script>
		<script src='//www.google.com/recaptcha/api.js'></script>
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
				<a class="nav-link active" href="#">Register <span class="sr-only">(current)</span></a>
			  </li>
			  <li class="nav-item">
				<a class="nav-link" href="play.php">Play Now!</a>
			  </li>
			</ul>
		  </div>
		</nav>
		
		<center>
			<?php
				if($success)
				{
					//registration successful
					echo('<h1 style="margin-top: 3vh; font-weight: 100;" >Welcome to <span style="font-family: \'Kaushan Script\' !important;">ShootThis</span>, <span style="font-weight: 300 !important;">' . htmlspecialchars($_POST['username']) . '</span>!</h1><br><a href="play.php" class="animate__animated animate__fadeInUp btn btn-light btn-lg active" style="margin-top: 20px; box-shadow: 0 0px 10px rgba(255, 255, 255, 1) !important;" role="button">Play Now!</a>');
					die();
				}
			?>
			<h1 style="margin-top: 3vh; font-weight: 100;" >Create a <span style="font-family: 'Kaushan Script' !important;">ShootThis</span> account</h1>
			<?php if(!empty($error)): ?>
				<h2 style="font-weight: 400; margin-top: 2vh;">The following errors have occurred:</h2>
				<?php printErrors($error); ?>
				<div style="margin-bottom: 2vh;"></div>
			<?php endif; ?>
			<div class="card" style="width: 85vw;">
				<form action="" method="post" class="card-body">
					<label for="inputUsername">Username</label>
					<input id="inputUsername" class="form-control" aria-describedby="usernameHelp" style="width: 80vw !important;" name="username"  pattern="[A-Za-z0-9].{3,}" maxlength="16" type="text" placeholder="Username" required>
					<small id="usernameHelp" class="form-text text-muted">
						Your username must be 4-16 characters long and it can contain only letters and numbers.
					</small>
					<br>
					<label for="inputPassword">Password</label>
					<input id="inputPassword" class="form-control" aria-describedby="passwordHelp" style="width: 80vw !important;" name="password"  pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$" maxlength="18" type="password" placeholder="Password" required>
					<small id="passwordHelp" class="form-text text-muted">
						Your password must be 7-18 characters long and it can contain only letters and numbers. <b>You need to use at least 1 letter and 1 number.</b>
					</small>
					<br>
					<label for="inputPasswordRepeat">Repeat Password</label>
					<input id="inputPasswordRepeat" class="form-control" aria-describedby="passwordRepeatHelp" style="width: 80vw !important;" name="repeatpassword"  pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$" maxlength="18" type="password" placeholder="Repeat Password" required>
					<small id="passwordRepeatHelp" class="form-text text-muted">
						Make sure this password matches the one you entered above.
					</small>
					<br>
					<label for="inputEmail">Email</label>
					<input id="inputEmail" class="form-control" aria-describedby="emailHelp" style="width: 80vw !important;" name="email" type="email" placeholder="Email address" required>
					<small id="emailHelp" class="form-text text-muted">
						Please use a valid email. We will try validating it, but you should be careful when you input it. <b>We will use your email only for security purposes and inquiries related to your ShootThis account.</b>
					</small>
					<br>
					<?php
						if($recaptchaPublic && $recaptchaSecret)
							echo '<div id="recaptcha" class="g-recaptcha" data-sitekey="' . $recaptchaPublic . '" align="center" style="margin-bottom: 10px; transform: scale(1); -webkit-transform: scale(1); transform-origin:0 0;-webkit-transform-origin:0 0;"></div>';
					?>
					<input type="submit" name="submit" value="Sign Up" class="btn btn-info btn-lg active">
				</form>
				<?php 
					if(!empty($error))
						echo '<script>document.getElementById("inputUsername").value = "'. htmlspecialchars($_POST['username']) . '"; document.getElementById("inputEmail").value = "' . htmlspecialchars($_POST['email']) . '";</script>';
				?>
			</div>
		</center>
		
	</body>
</html>
