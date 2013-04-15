<?php
require_once 'mySqlConnection.php';

class DataInserter {

	private $_idFile = 1;

	public function InsertOCDE($fileName, $sheet) {
		$sql = MySqlConnection::getConnection();

		//insert file name
		$query = "INSERT INTO file (name) VALUES ('" . mysql_real_escape_string($fileName) . "')";
		(mysql_query($query) and $this->_idFile = mysql_insert_id())
		or die('Query "' . $query . '" failed:</br>' . mysql_error());

		//get years
		$years = array();
		foreach($sheet[0][0] as $key => $value) {
			if ($key > 1) {
				$years[] = $value;
			}
		}

		//insert values
		$it = 0;
		$flag = 0;
		$querya = "";
		$idEntity = array();
		$idEntry = array();
		foreach($sheet[0] as $line) {
			if ($flag != 0) {
				foreach($line as $key => $value) {
					if ($key == 0) {
						//insert entity
						$entity = mysql_real_escape_string($value);
						if (!array_key_exists($entity, $idEntity))
						{
							$query = "INSERT INTO entities (idFile, name) VALUES ('" . $this->_idFile . "', '" . $entity . "')";
							(mysql_query($query) and $idEntity[$entity] = mysql_insert_id())
							or die('Query "' . $query . '" failed:</br>' . mysql_error());
						}
					}
					elseif ($key == 1) {
						//insert entrie
						$entry = mysql_real_escape_string($value);
						if (!array_key_exists($entry, $idEntry))
						{
							$query = "INSERT INTO entries (idFile, name) VALUES ('" . $this->_idFile . "', '" . $entry . "')";
							(mysql_query($query) and $idEntry[$entry] = mysql_insert_id())
							or die('Query "' . $query . '" failed:</br>' . mysql_error());
						}
					}
					else
					{
						if ($it > 10000) {
							mysql_query("INSERT INTO data (idFile, idEntity, idEntry, date, value) VALUES " . $querya) or die('Query "' . "INSERT INTO data (idFile, idEntity, idEntry, date, value) VALUES " . $querya . '" failed:</br>' . mysql_error());
							$querya = "";
							$it = 0;
						}
						$it++;
						//insert value
						if ($querya != "")
							$querya .= ",";
						if (!strcmp($value, ""))
							$querya .= " ('" . $this->_idFile . "', '" . $idEntity[$entity] . "', '" . $idEntry[$entry] . "', '" . $years[$key - 2] . "', NULL)";
						else
							$querya .= " ('" . $this->_idFile . "', '" . $idEntity[$entity] . "', '" . $idEntry[$entry] . "', '" . $years[$key - 2] . "', '" . mysql_real_escape_string(str_replace(",", ".", $value)) . "')";
					}
				}
			} else {
				$flag = 1;
			}
		}
		if ($querya != "")
			mysql_query("INSERT INTO data (idFile, idEntity, idEntry, date, value) VALUES " . $querya) or die('Query "' . "INSERT INTO data (idFile, idEntity, idEntry, date, value) VALUES " . $querya . '" failed:</br>' . mysql_error());
	}

	public function InsertOther($fileName, $entityColumn, $yearColumn, $sheet) {
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
		foreach ($sheet[0] as $line) {
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
		$sql = MySqlConnection::getConnection();
		//get entities from the file
		$query = "SELECT id,name FROM entities WHERE idFile = '" . $this->_idFile . "'";
		$ret = mysql_query($query);
		$entities = array();
		while ($line = mysql_fetch_assoc($ret)) {
			$entities[$line['name']] = $line['id'];
		}

		//get entries from the file
		$ret = mysql_query("SELECT id,name FROM entries WHERE idFile = '" . $this->_idFile . "'");
		$entries = array();
		while ($line = mysql_fetch_assoc($ret)) {
			$entries[$line['name']] = $line['id'];
		}

		$data = array();
		foreach ($entities as $entity => $idEntity) {
			$query = "SELECT * FROM data WHERE idEntity = '" . $idEntity . "' ORDER BY idEntity, idEntry, date";
			$ret = mysql_query($query);

			while ($line = mysql_fetch_assoc($ret)) {
				$data[$line['idEntry']][$line['date']][0] = $line['id'];
				if ($line['value'] === null)
					$data[$line['idEntry']][$line['date']][1] = null;
				else
					$data[$line['idEntry']][$line['date']][1] = $line['value'];
			}

			foreach ($data as $kentr => $entr) {
				//we cant complete null data while we havent one data yet.
				while (list($id, $val) = current($entr) and $val === null) {
					list($var, $val) = next($entr);
					if ($val !== null)
						break;
				}

				//browse data we already have
				while (list($id, $val) = current($entr)) {
					while (list($id, $val) = current($entr) and $val !== null) {
						list($id, $val) = next($entr);
					}

					if (current($entr) and ($nextVal = $this->findNextValue($entr)) !== null) {
						//							echo "dafuk ?</br>";
						$prevDate = $val;
						list($prevId, $prevVal) = prev($entr);
						next($entr);
						$nextValue = $prevVal + (($nextVal[1] - $prevVal) / ($nextVal[0] - $prevDate));
						$query = "UPDATE data SET value='" . $nextValue . "' WHERE id='" . $id . "'";
						//echo $query . "</br>";
						mysql_query($query);
						$entr[key($entr)][1] = $nextValue;
					}
					next($entr);
				}
			}
		}
	}

	private function findNextValue($entr) {
		list($id, $val) = current($entr);

		$it = 0;
		$ret = array();
		while (current($entr) and $val === null) {
			list($id, $val) = next($entr);
			$ret = array(key($entr), $val);
			$it++;
		}

		while ($it > 0) {
			prev($entr);
			$it--;
		}

		if (!current($entr))
			return null;
		return $ret;
	}

}
