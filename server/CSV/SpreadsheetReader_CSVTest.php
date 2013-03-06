<?php
// Call SpreadsheetReader_ExcelTest::main() if this source file is executed directly.
if (!defined("PHPUnit_MAIN_METHOD")) {
    define("PHPUnit_MAIN_METHOD", "SpreadsheetReader_CSVTest::main");
}

require_once "PHPUnit/Framework/TestCase.php";
require_once "PHPUnit/Framework/TestSuite.php";

require_once dirname(__FILE__) . '/SpreadsheetReader_CSV.php';

/**
 * Test class for SpreadsheetReader_CSV.
 * Generated by PHPUnit_Util_Skeleton on 2007-01-26 at 08:50:15.
 */
class SpreadsheetReader_CSVTest extends PHPUnit_Framework_TestCase {
    /**
     * Runs the test methods of this class.
     *
     * @access public
     * @static
     */
    public static function main() {
        require_once "PHPUnit/TextUI/TestRunner.php";

        $suite  = new PHPUnit_Framework_TestSuite("SpreadsheetReader_CSVTest");
        $result = PHPUnit_TextUI_TestRunner::run($suite);
    }

    public $xlsReader;
    /**
     * Sets up the fixture, for example, open a network connection.
     * This method is called before a test is executed.
     *
     * @access protected
     */
    protected function setUp() {
        $this->xlsReader = new SpreadsheetReader_CSV;
    }

    /**
     * Tears down the fixture, for example, close a network connection.
     * This method is called after a test is executed.
     *
     * @access protected
     */
    protected function tearDown() {
    }

    /**
     * case: 檔案不存在。
     * result: FALSE
     *
     * @test
     */
    public function SpreadsheetFileIsNotExisted() {
        $xlsFilePath = '';
        $sheets = $this->xlsReader->read($xlsFilePath);
        $this->assertFalse($sheets);
    }

    /**
     * case: 讀取 test.csv
     * result:
     *  1 sheets.
     *  128 rows of first sheet.
     *  38 rows of second sheet.
     *  11 columns of first row of first sheet.
     *  Row 4 of first sheet contains value '324203026'
     *  Value of B:20 of sheet is 153186.
     *
     * @test
     */
    public function ReadFromExcelFile() {
        $xlsFilePath = 'test.csv';
        $sheets = $this->xlsReader->read($xlsFilePath);
        $this->assertEquals(1, count($sheets));
        $this->assertEquals(128, count($sheets[0]));
        $this->assertEquals(11, count($sheets[0][0]));
        $this->assertContains('324203026', $sheets[0][3]);
        $this->assertEquals('153186', $sheets[0][19][1]);
    }

    /**
     * case: 讀取 test.csv AS XMLString.
     * result:
     *  A XML String.
     *
     * @todo not implemented
     *
     * @ test
     */
    public function ReadExcelFileToXmlString() {
        $xlsFilePath = 'test.csv';
        $xmlString = $this->xlsReader->read($xlsFilePath, 'string');
        $this->assertTrue(strpos($xmlString, '<?xml ') == 0);
    }
}

// Call SpreadsheetReader_OpenDocumentSheet::main() if this source file is executed directly.
if (PHPUnit_MAIN_METHOD == "SpreadsheetReader_CSVTest::main") {
    SpreadsheetReader_CSVTest::main();
}
?>
