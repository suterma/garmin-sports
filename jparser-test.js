var fs = require('fs');
var fitTypes = require('./fitTypes');





fs.readFile('1825276680.fit', function (err, data) {
    var fileHeader = fitTypes.CreateFileHeader(data);
    console.log(fileHeader);

    var records = fitTypes.CreateFileRecords(data, fileHeader);
    console.log(records);

});