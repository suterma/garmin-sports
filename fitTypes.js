// File fitTypes.js
module.exports = {
    /*
* Extracts the FIT file header from a complete FIT file
* data: The raw file content as Uint8Array
*/
    CreateFileHeader: function (data) {
        return new FileHeader(data);
    },
    /*
    * Extracts the FIT file records from a complete FIT file
    * data: The raw file content as Uint8Array
    * header: The already parsed header from the FIT file
    */
    CreateFileRecords: function (data, header) {
        return new FileRecords(data, header);
    }
};

//Creates FIT Message Field Definition
function FieldDefinition(fieldDefinitionByteZero, fieldDefinitionByteOne, fieldDefinitionByteTwo) {
    var fieldDefinition = new Object();
    fieldDefinition.fieldDefinitionNumber = fieldDefinitionByteZero;
    fieldDefinition.size = fieldDefinitionByteOne;
    fieldDefinition.baseType = fieldDefinitionByteTwo;
    return fieldDefinition;
}


/*
* Extracts the FIT file records from a complete FIT file
* data: The raw file content as Uint8Array
* header: The already parsed header from the FIT file
*/
function FileRecords(data, header) {

    //Convert the file content part (skipping the header) to an ArrayBuffer for convenient reading with a DataView instance
    var arrayBuffer = data.buffer.slice(header.headerSize, data.byteLength);
    var dv = new DataView(arrayBuffer);

    //start at first record.
    var pos = 0;

    //TODO use some loop
    //Read one record
    //TODO use some array type
    var record = new Object();
    recordHeaderByte = dv.getUint8(pos); pos += 1;
    //console.log("recordHeaderByte: " + recordHeaderByte);

    var FLAG_BIT_0 = 1;   // 00000001
    var FLAG_BIT_1 = 2;   // 00000010
    var FLAG_BIT_2 = 4;   // 00000100
    var FLAG_BIT_3 = 8;   // 00001000
    var FLAG_BIT_4 = 16;  // 00010000
    var FLAG_BIT_5 = 32;  // 00100000
    var FLAG_BIT_6 = 64;  // 01000000
    var FLAG_BIT_7 = 128; // 10000000

    record.normalHeader = (recordHeaderByte & FLAG_BIT_7) / FLAG_BIT_7; // Value 0 is Normal Header
    record.messageType = (recordHeaderByte & FLAG_BIT_6) / FLAG_BIT_6; // 1: Definition Message 0: Data Message
    record.messageTypeSpecific = (recordHeaderByte & FLAG_BIT_5) / FLAG_BIT_5; //Value 0 is default
    record.reserved = (recordHeaderByte & FLAG_BIT_4) / FLAG_BIT_4;
    record.localMessageType = recordHeaderByte % 16; //Bits 0 thru 3, Local Message Type, Value ranges from 0 to 15;

    //Create a record according to the  message type
    //Definiton Message
    if (record.messageType === 1) {
        record.reserved = dv.getUint8(pos); pos += 1;//0 by default
        record.architecture = dv.getUint8(pos); pos += 1; //0: Definition and Data Messages are Little Endian 1: Definition and Data Message are Big Endian
        record.globalMessageNumber = dv.getUint16(pos); pos += 2; //0:65535 – Unique to each message. Endianness of this 2 Byte value is defined in the Architecture byte
        record.numberOfFields = dv.getUint8(pos); pos += 1; //Number of fields in the Data Message
        //read field definitions
        record.fieldDefinition = new Array(record.numberOfFields);
        for (var i = 0; i < record.numberOfFields; i++) {
            var fieldDefinitionByteZero = dv.getUint8(pos); pos += 1;
            var fieldDefinitionByteOne = dv.getUint8(pos); pos += 1;
            var fieldDefinitionByteTwo = dv.getUint8(pos); pos += 1;
            record.fieldDefinition[i] = new FieldDefinition(fieldDefinitionByteZero, fieldDefinitionByteOne, fieldDefinitionByteTwo);
        }

        //TODO read/skip developer fields
    }
    //else Data Message
    return record;
}

/*
* Extracts the FIT file header from a complete FIT file
* data: The raw file content as Uint8Array
*/
function FileHeader(data) {
    var header = new Object();
    //Convert to ArrayBuffer for convenient reading with a DataView instance
    var arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
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
