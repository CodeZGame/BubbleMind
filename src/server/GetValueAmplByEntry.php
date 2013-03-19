<?php
require_once 'mySqlConnection.php';

if (isset($_GET['idFile']) and isset($_GET['idEntry']) and is_numeric($_GET['idFile']) and is_numeric($_GET['idEntry']))
{
	$sql = MySqlConnection::getConnection();
	$value = array();

	//get value min
	$query = "SELECT value FROM data WHERE idFile = '" . $_GET['idFile'] . "' AND idEntry = '" . $_GET['idEntry'] . "' AND value IS NOT NULL ORDER BY value ASC LIMIT 1";
	$ret = mysql_query($query);
	if ($line = mysql_fetch_assoc($ret)) {
		$value['min'] = $line['value'];	
	}
	
	//get value max
	$query = "SELECT value FROM data WHERE idFile = '" . $_GET['idFile'] . "' AND idEntry = '" . $_GET['idEntry'] . "' AND value IS NOT NULL ORDER BY value DESC LIMIT 1";
	$ret = mysql_query($query);
	if ($line = mysql_fetch_assoc($ret)) {
		$value['max'] = $line['value'];
	}
	
	$resp = json_encode($value, JSON_FORCE_OBJECT);
	echo $resp;
}