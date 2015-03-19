<?php
	date_default_timezone_set('America/Tegucigalpa');

	$cssFilepath = "www/css/main.c.css";
	$cssFile = fopen($cssFilepath, 'r');
	$css = fread($cssFile, filesize($cssFilepath));
	fclose($cssFile);

	$jsFilepath = "www/js/main.xmin.js";
	$jsFile = fopen($jsFilepath, 'r');
	$js = fread($jsFile, filesize($jsFilepath));
	fclose($jsFile);

	$codebirdFilepath = "www/js/codebird.min.js";
	$codebirdFile = fopen($codebirdFilepath, 'r');
	$codebird = fread($codebirdFile, filesize($codebirdFilepath));
	fclose($codebirdFile);

	$defaultQuery = '#trending';

?><!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0 maximum-scale=1, user-scalable=no" />
		<meta name="apple-mobile-web-app-capable" content="yes">
		<title>Twangler</title>
		<meta name="description" content="Twitter experience. Track trending topics and live events.">
		<style><?php 
			echo $css; 
		?></style>
		<link href="http://netdna.bootstrapcdn.com/font-awesome/2.0/css/font-awesome.css" rel="stylesheet">
	</head>
	<body>
		<script><?php 
			if ( $defaultQuery )
				echo "dQ='$defaultQuery';";
			echo $sha1; 
			echo $codebird; 
			echo $js; 
		?></script>
	</body>
</html>