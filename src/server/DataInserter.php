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
				$query = "SELECT id,date,value FROM data WHERE idEntity = '" . $idEntity . "' AND idEntry = '" . $idEntry . "' ORDER BY date";
				$ret = mysql_query($query);
				while ($line = mysql_fetch_assoc($ret)) {
					if ($line['value'] === null)
						$values[] = array(intval($line['date']), null, $line['id']);
					else
						$values[] = array(intval($line['date']), floatval($line['value']), $line['id']);
				}
				$it = 0;
				$len = count($values);
				//we cant complete null data while we havent one data yet.
				while ($it < $len and $values[$it][1] === null)
					$it++;
				while ($it < $len) {
					while ($it < $len and $values[$it][1] !== null)
						$it++;
						
					//check if it's possible de complete the missing data, then do it if possible
					if (($itNextValue = $this->findNextValue($it, $values)) > 0) {
						$nextValue = $values[$it - 1][1] + (($values[$itNextValue][1] - $values[$it - 1][1]) / ($values[$itNextValue][0] - $values[$it - 1][0]));
						$query = "UPDATE data SET idFile='" . $this->_idFile . "', idEntity='" . $idEntity . "', idEntry='" . $idEntry . "', date='" . $values[$it][0] . "', value='" . $nextValue . "' WHERE id='" . $values[$it][2] . "'";
						mysql_query($query);
						$values[$it] = array($values[$it][0], $nextValue);
					}
					$it++;
				}
			}
		}

	}

	private function findNextValue($it, $values) {
		$len = count($values);
		while ($it < $len and $values[$it][1] === null)
			$it++;
		if ($it >= $len)
			return 0;
		return $it;
	}

}