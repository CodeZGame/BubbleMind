<?php

require_once 'SpreadsheetReaderFactory.php';

class Parser {
	
	private $_sheet;
	
	function parse($fileName)
	{
		$reader = SpreadsheetReaderFactory::reader($fileName);
		$_sheet = $reader->read($fileName);
		return $_sheet;
	}
}