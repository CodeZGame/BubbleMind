<?php
require_once 'Parser.php';
require_once 'DataInserter.php';

$parser = new Parser();
$insert = new DataInserter();

foreach($_FILES as $file)
{
	if ($file["error"] > 0)
	{
		echo "Error: please check you correctly selected a file.";
	}
	else
	{
		if (file_exists("upload/" . $file["name"]))
		{
			echo "File already in database.";
		}
		else
		{
			move_uploaded_file($file["tmp_name"], "upload/" . $file["name"]);
			$sheet = $parser->parse("upload/" . $file["name"]);
			// dynamic $entityColumn and $yearColumn
			$insert->InsertData($file["name"], 0, 1, $sheet);
			$insert->CompleteData();
			echo "File successfully added to database.";
		}
		break;
	}
}
?>

<script language="javascript" type="text/javascript">
	window.setTimeout('window.location="index.html"; ',2000);
</script>
