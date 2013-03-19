<?php
require_once 'mySqlConnection.php';

if (isset($_GET['idFile']) and isset($_GET['idEntry']) and is_numeric($_GET['idFile']) and is_numeric($_GET['idEntry']))
{
	$sql = MySqlConnection::getConnection();
	$year = array();

	//get date min
	$query = "SELECT date FROM data WHERE idFile = '" . $_GET['idFile'] . "' AND idEntry = '" . $_GET['idEntry'] . "' AND value IS NOT NULL ORDER BY date ASC LIMIT 1";
	$ret = mysql_query($query);
	if ($line = mysql_fetch_assoc($ret)) {
		$year['min'] = $line['date'];	
	}
	
	//get date max
	$query = "SELECT date FROM data WHERE idFile = '" . $_GET['idFile'] . "' AND idEntry = '" . $_GET['idEntry'] . "' AND value IS NOT NULL ORDER BY date DESC LIMIT 1";
	$ret = mysql_query($query);
	if ($line = mysql_fetch_assoc($ret)) {
		$year['max'] = $line['date'];
	}
	
	$resp = json_encode($year, JSON_FORCE_OBJECT);
	echo $resp;
}