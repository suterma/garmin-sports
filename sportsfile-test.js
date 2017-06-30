/*
* A test program (for use with node.js) which uses the FIT Types as a FIT file parser. Loads and parses a GARMIN Sports file.
*/
var fs = require('fs');
require('buffer');
const util = require('util')

var fitTypes = require('./fitTypes');

fs.readFile('5CITYRUN.FIT', parseFitFile);

/*
* Parses a loaded, complete FIT file
* err: if defined, an error that occurred when loading the file
* data: The raw file content as Uint8Array
*/
function parseFitFile(err, data) {
    if (err !== null) {
        throw err;
    }

    var fileHeader = fitTypes.CreateFileHeader(data);
    console.log(fileHeader);

    var records = fitTypes.CreateFileRecords(data, fileHeader);
    console.log(util.inspect(records, {showHidden: false, depth: null}))
}
