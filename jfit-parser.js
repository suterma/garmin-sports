/* A JavaScript FIT file parser */

/* Parses the Header part of a FIT file */
function parseHeader(filebytes)
{
  var headerSize = filebytes.charCodeAt(0);
  var protocolVersion = filebytes.charCodeAt(1);
  //var profileVersion = getWord[filebytes, 2);

  //TODO debug
  console.log('Header Size: ' + headerSize);
  console.log('Protocol Version: ' + protocolVersion);

  var header = { };
  header.size = filebytes.charCodeAt(0);
  header.protocolVersion = filebytes.charCodeAt(1);

return header;

}
