<?php
require_once 'mySqlConnection.php';

class DataInserter {

	private $_idFile;

	public function InsertData($fileName, $entityColumn, $yearColumn, $sheet) {
		$sql = MySqlConnection::getConnection();

		//insert file name
		$query = "INSERT INTO file (name) VALUES ('" . mysql_real_escape_string($fileName) . "')";
		(mysql_query($query) and $this->_idFile = mysql_insert_id())
		or die('Query "' . $query . '" failed:</br>' . mysql_error());

		//insert entries
		$idEntries = array();
		foreach($sheet[0][0] as $key => $value) {
			if ($key != $entityColumn && $key != $yearColumn) {
				$query = "INSERT INTO entries (idFile, name) VALUES ('" . $this->_idFile . "', '" . mysql_real_escape_string($value) . "')";
				(mysql_query($query) and $idEntries[] = mysql_insert_id())
				or die('Query "' . $query . '" failed:</br>' . mysql_error());
			}
		}

		//insert values
		$flag = 0;
		$idEntity = array();
		foreach($sheet[0] as $line) {
			$it = 0;
			if ($flag != 0) {
				foreach($line as $key => $value) {
					$entity = mysql_real_escape_string($line[$entityColumn]);
					if ($key == $entityColumn) {
						//insert entity
						if (!array_key_exists($entity, $idEntity))
						{
							$query = "INSERT INTO entities (idFile, name) VALUES ('" . $this->_idFile . "', '" . $entity . "')";
							(mysql_query($query) and $idEntity[$entity] = mysql_insert_id())
							or die('Query "' . $query . '" failed:</br>' . mysql_error());
						}

					}
					elseif ($key != $yearColumn) {
						//insert value
						if (!strcmp($value, ""))
							$query = "INSERT INTO data (idFile, idEntity, idEntry, date, value) VALUES ('" . $this->_idFile . "', '" . $idEntity[$entity] . "', '" . $idEntries[$it] . "', '" . mysql_real_escape_string($line[$yearColumn]) . "', NULL)";
						else
							$query = "INSERT INTO data (idFile, idEntity, idEntry, date, value) VALUES ('" . $this->_idFile . "', '" . $idEntity[$entity] . "', '" . $idEntries[$it] . "', '" . mysql_real_escape_string($line[$yearColumn]) . "', '" . mysql_real_escape_string(str_replace(",", ".", $value)) . "')";
						(mysql_query($query) and $idEntries[] = mysql_insert_id())
						or die('Query "' . $query . '" failed:</br>' . mysql_error());
						$it++;
					}
				}
			} else {
				$flag = 1;
			}
		}
	}

	public function CompleteData() {
		//get entities from the file
		$query = "SELECT id,name FROM entities WHERE idFile = '" . $this->_idFile . "'";
		$ret = mysql_query($query);
		$entities = array();
		while ($line = mysql_fetch_assoc($ret)) {
			$entities[$line['name']] = $line['id']; 
		}
		
		//get entries from the file
		$query = "SELECT id,name FROM entries WHERE idFile = '" . $this->_idFile . "'";
		$ret = mysql_query($query);
		$entries = array();
		while ($line = mysql_fetch_assoc($ret)) {
			$entries[$line['name']] = $line['id'];
		}

		foreach($entities as $entity => $idEntity) {
			foreach($entries as $entry => $idEntry) {
				$values = array();
				//get data for a specific entity and entry
				$query = "SELECT date,value FROM data WHERE idEntity = '" . $idEntity . "' AND idEntry = '" . $idEntry . "'";
				$ret = mysql_query($query);
				while ($line = mysql_fetch_assoc($ret)) {
					$values[$line['date']] = $line['value'];
				}
				var_dump($values);
			}
			
		}

	}
}