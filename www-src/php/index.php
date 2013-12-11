<?php
	date_default_timezone_set('America/Tegucigalpa');

	//see http://stackoverflow.com/questions/4587425/php-function-that-receive-a-cron-string-and-return-the-next-run-timestamp
	function parse_crontab($crontab) {
		$time = 'now';
		$time=explode(' ', date('i G j n w', strtotime($time)));
		$crontab=explode(' ', $crontab);
		foreach ($crontab as $k=>&$v) {
			$v=explode(',', $v);
			foreach ($v as &$v1) {
				$v1=preg_replace(
					array('/^\*$/', '/^\d+$/', '/^(\d+)\-(\d+)$/', '/^\*\/(\d+)$/'),
					array('true', $time[$k].'===\0', '(\1<='.$time[$k].' and '.$time[$k].'<=\2)', $time[$k].'%\1===0'),
					$v1
				);
			}
			$v='('.implode(' or ', $v).')';
		}
		$crontab=implode(' and ', $crontab);
		return eval('return '.$crontab.';');
	}

	function getRandomTrendingTopic() {
		$url = "http://api.whatthetrend.com/api/v2/trends.json?api_key=96656a87ec6ae60b665194ecb5cd4134420bbd02&place_type_code=2443945";
		$json = file_get_contents($url);
		$trends = json_decode($json, true);
		$trends = $trends["trends"];
		$randomTrend = $trends[array_rand($trends)];
		return $randomTrend["name"];
	}

	$cssFilepath = "www/css/main.c.css";
	$cssFile = fopen($cssFilepath, 'r');
	$css = fread($cssFile, filesize($cssFilepath));
	fclose($cssFile);

	$jsFilepath = "www/js/main.xmin.js";
	$jsFile = fopen($jsFilepath, 'r');
	$js = fread($jsFile, filesize($jsFilepath));
	fclose($jsFile);

	$sha1Filepath = "www/js/sha1.js";
	$sha1File = fopen($sha1Filepath, 'r');
	$sha1 = fread($sha1File, filesize($sha1Filepath));
	fclose($sha1File);

	$codebirdFilepath = "www/js/codebird.js";
	$codebirdFile = fopen($codebirdFilepath, 'r');
	$codebird = fread($codebirdFile, filesize($codebirdFilepath));
	fclose($codebirdFile);


	//see http://en.wikipedia.org/wiki/Cron
	if (parse_crontab('* 10-19 * * 0')) //Sunday Football
		$defaultQuery = '#nfl';
	elseif (parse_crontab('* 21 * * 0')) //Homeland / Boardwalk Empire tv show
		$defaultQuery = '#Homeland OR #BoardwalkEmpire';
	elseif (parse_crontab('* 21 * * 1')) //Revolution tv show
		$defaultQuery = '#Revolution';
	elseif (parse_crontab('* 20-23 * * 0')) //BCS standings release
		$defaultQuery = '#bcs';
	elseif (parse_crontab('* 12-19 * * 0')) //Sunday Football
		$defaultQuery = '#nfl';
	elseif (parse_crontab('* 18-22 * * 1')) //Monday Night Football
		$defaultQuery = '#nfl';
	elseif (parse_crontab('* 9 * * 1-5')) //ESPN First Take
		$defaultQuery = '#ESPNFirstTake';
	elseif (parse_crontab('* 11-22 * * 6')) //NCAA Football
		$defaultQuery = '#football';
	else
		//$defaultQuery = 'meme';
		getRandomTrendingTopic();

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
		<link href="//netdna.bootstrapcdn.com/font-awesome/2.0/css/font-awesome.css" rel="stylesheet">
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