var fs = require('fs');
require('buffer');

var fitTypes = require('./fitTypes');





fs.readFile('5CITYRUN.FIT', function (err, data) {
  if (data === undefined)
  {
    throw 'File not found.';
  };

    var fileHeader = fitTypes.CreateFileHeader(data);
    console.log(fileHeader);

    var records = fitTypes.CreateFileRecords(data, fileHeader);
    console.log(records);

});
