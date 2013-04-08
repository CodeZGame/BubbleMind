<?php
class MySqlConnection {
	private $connection;

	private function __construct(){
		$this->connection = mysql_connect("localhost", "root", "")
		or die("Unable to connect to database : " . mysql_error());
		mysql_select_db("pfa", $this->connection);
	}

	private function getConnec(){
		return $this->connection;
	}
	
	public static function getConnection(){
		static $_instance = null;
		if ($_instance == null)
			$_instance = new MySqlConnection();
		return $_instance->getConnec();
	}
	
	function __destruct() {
		mysql_close($this->connection);
	}
}