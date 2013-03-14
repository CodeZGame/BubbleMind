<?php
require_once 'mySqlConnection.php';

if (isset($_GET['id']) and is_numeric($_GET['id']))
{
	$sql = MySqlConnection::getConnection();
	$query = "SELECT name FROM entities WHERE idFile = '" . mysql_real_escape_string($_GET["id"]) . "'";
	$ret = mysql_query($query);
	$entities = array();
	while ($line = mysql_fetch_assoc($ret)) {
		$entities[] = $line['name'];
	}
	$resp = json_encode($entities, JSON_FORCE_OBJECT);
	echo $resp;
}