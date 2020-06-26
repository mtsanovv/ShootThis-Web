<?php
include_once 'class.verifyEmail.php';

if(empty($_GET["email"]))
{
	echo 'error';
	die();
}

$email = htmlspecialchars($_GET["email"]);

$vmail = new verifyEmail();
$vmail->setStreamTimeoutWait(50);

if ($vmail->check($email) || explode("@", $email)[1] == "protonmail.com") {
	echo 'exists';
} elseif (verifyEmail::validate($email)) {
	echo 'valid';
} else {
	echo 'invalid';
}
?>
