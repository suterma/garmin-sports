/*
* A test program (for use with node.js) which uses the FIT Types as a FIT file parser. Loads and parses a GARMIN Sports file.
*/
var fs = require('fs');
require('buffer');
require('text-encoding');
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
    
    var fitFile = fitTypes.ParseFitFile(data);
    console.log(util.inspect(fitFile, {showHidden: false, depth: null}))
}
