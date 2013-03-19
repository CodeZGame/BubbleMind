<?php
require_once 'mySqlConnection.php';

if (isset($_GET['idFile']) and is_numeric($_GET['idFile']))
{
	$sql = MySqlConnection::getConnection();
	$query = "SELECT id,name FROM entries WHERE idFile = '" . $_GET["idFile"] . "'";
	$ret = mysql_query($query);
	$entries = array();
	while ($line = mysql_fetch_assoc($ret)) {
		$entries[$line['id']] = $line['name'];
	}
	$resp = json_encode($entries, JSON_FORCE_OBJECT);
	echo $resp;
}