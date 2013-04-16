<?php
require_once 'mySqlConnection.php';

$sql = MySqlConnection::getConnection();
$query = "SELECT id, name FROM file";
$ret = mysql_query($query);
$files = array();
while ($line = mysql_fetch_assoc($ret)) {
	$files[$line['id']] = $line['name'];
}
$resp = json_encode($files, JSON_FORCE_OBJECT);
echo $resp;