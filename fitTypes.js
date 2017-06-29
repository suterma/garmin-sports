// File fitTypes.js
module.exports = {
    CreateFileHeader: function (buf) {
        return new FileHeader(buf)
    },
    CreateFileRecords: function (buf, header) {
        return new FileRecords(buf, header)
    }
};

//Creates FIT file records out of a file buffer (from node.js buffer type), respecing the given, parsed header
function FileRecords(buf, header) {

    //Umwandeln in ein ArrayBuffer für das bequeme Lesen mit DataView
    var arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    var dv = new DataView(arrayBuffer);

    //skip the header, go to first record
    var pos = header.headerSize;

    //Read one record
    //TODO use some array type
    var record = new Object();
    recordHeaderByte = dv.getUint8(pos); pos = pos + 1;
    console.log("recordHeaderByte: " + recordHeaderByte);

    var FLAG_BIT_1 = 1;   // 00000001
    var FLAG_BIT_2 = 2;   // 00000010
    var FLAG_BIT_3 = 4;   // 00000100
    var FLAG_BIT_4 = 8;   // 00001000
    var FLAG_BIT_5 = 16;  // 00010000
    var FLAG_BIT_6 = 32;  // 00100000
    var FLAG_BIT_7 = 64;  // 01000000
    var FLAG_BIT_8 = 128; // 10000000

    record.isNormalHeader = (recordHeaderByte & FLAG_BIT_7) === 0; // Value of Zero is Normal Header
    record.messageType = (recordHeaderByte & FLAG_BIT_6); // 1: Definition Message 0: Data Message
    record.messageTypeSpecific = (recordHeaderByte & FLAG_BIT_5); //Value 0 is default
    record.reserved = (recordHeaderByte & FLAG_BIT_4)
    record.localMessageType = recordHeaderByte % 16; //Bits 0 thru 3, Local Message Type, Value ranges from 0 to 15;
    return record;
}

//Creates a FIT file header out of a file buffer (from node.js buffer type)
function FileHeader(buf) {
    var header = new Object();
    //Umwandeln in ein ArrayBuffer für das bequeme Lesen mit DataView
    var arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    var dv = new DataView(arrayBuffer);

    header.headerSize = dv.getUint8(0);
    header.version = dv.getUint8(1);
    header.profileVersion = dv.getUint16(2, true); //little-endian
    header.dataSize = dv.getUint32(4, true); //little-endian
    header.dataType =
        String.fromCharCode(dv.getUint8(8)) +
        String.fromCharCode(dv.getUint8(9)) +
        String.fromCharCode(dv.getUint8(10)) +
        String.fromCharCode(dv.getUint8(11));
    //CRC is depending on header data lenght
    if (header.headerSize === 12) //short header
    {
        header.CRC = dv.getUint8(12);
    }
    else if (header.headerSize === 14) //long header
    {
        header.CRC = dv.getUint16(12);
    }
    else header.CRC = 0;
    return header;
}