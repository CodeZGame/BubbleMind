<?php
require_once 'mySqlConnection.php';

if (isset($_GET['idFile']) and isset($_GET['idEntry']) and is_numeric($_GET['idFile']) and is_numeric($_GET['idEntry']))
{
	$sql = MySqlConnection::getConnection();

 	//get Entities
 	$query = "SELECT id, name FROM entities WHERE idFile = '" . $_GET["idFile"] . "'";
	$ret = mysql_query($query);
 	$entities = array();
 	while ($line = mysql_fetch_assoc($ret)) {
 		$entities[$line['id']] = $line['name'];
 	}

// 	//get data
// 	$data = array();
// 	foreach($entities as $key => $value) {
// 		$query = "SELECT date,value FROM data WHERE idFile = '" . $_GET["idFile"] . "' AND idEntity = '" . $key . "' AND idEntry = '" . $_GET['idEntry'] . "'";
// 		$ret = mysql_query($query);
// 		echo $query . "\n";
// 		$entity = array();
// 		while ($line = mysql_fetch_assoc($ret)) {
// 			$entity[$line['date']] =  $line['value'];
// 		}
// 		$data[$value] = $entity;
// 	}

	$data = array();
	$query = "SELECT idEntity, date, value FROM data WHERE idFile = '" . $_GET["idFile"] . "' AND idEntry = '" . $_GET['idEntry'] . "'";
 	$ret = mysql_query($query);
 	while ($line = mysql_fetch_assoc($ret)) {
 		if (!isset($data[$entities[$line['idEntity']]]))
 			$data[$entities[$line['idEntity']]] = array();
 		$data[$entities[$line['idEntity']]][$line['date']] = $line['value'];
 			//$entity[$line['date']] =  $line['value'];
	}
 	
 	
	$resp = json_encode($data); //, JSON_FORCE_OBJECT
	echo $resp;
}