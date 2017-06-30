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
function FieldDefinition(byteZero, byteOne, byteTwo) {
    var fieldDefinition = new Object();
    fieldDefinition.fieldDefinitionNumber = byteZero;
    fieldDefinition.size = byteOne;
    fieldDefinition.baseType = byteTwo;
    return fieldDefinition;
}
//Creates FIT Developer Data Field Description
function DeveloperFieldDescription(byteZero, byteOne, byteTwo) {
    var developerFieldDescription = new Object();
    developerFieldDescription.fieldNumber = byteZero;//Maps to the field_definition_number of a field_description Message
    developerFieldDescription.size = byteOne;//Size (in bytes) of the specified FIT message’s field
    developerFieldDescription.developerDataIndex = byteTwo;//Maps to the developer_data_index of a developer_data_id Message
    return developerFieldDescription;
}

/*
* Extracts a single FIT file record from a DataView of a complete FIT file data buffer.
* dataView: a DataView of the complete FIT file data buffer.
* pos: The current reading position in the dataView
*/
function FileRecord(dv, pos) {
    var initialPos = pos;
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
        record.numberOfFields = dv.getUint8(pos); pos += 1; //Number of fields in the Definition Message
        //read field definitions
        record.fieldDefinition = new Array(record.numberOfFields);
        for (var i = 0; i < record.numberOfFields; i++) {
            var byteZero = dv.getUint8(pos); pos += 1;
            var byteOne = dv.getUint8(pos); pos += 1;
            var byteTwo = dv.getUint8(pos); pos += 1;
            record.fieldDefinition[i] = new FieldDefinition(byteZero, byteOne, byteTwo);
        }

        //Definition message with Developer fields
        if(record.messageTypeSpecific === 1)
        {
            record.numberOfDeveloperFields = dv.getUint8(pos); pos += 1; //Number of developer fields in the Definition Message
            //read developer field definitions
            record.developerFieldDefinition = new Array(record.numberOfDeveloperFields);
            for (var i = 0; i < record.numberOfFields; i++) {
                var byteZero = dv.getUint8(pos); pos += 1;
                var byteOne = dv.getUint8(pos); pos += 1;
                var byteTwo = dv.getUint8(pos); pos += 1;
                record.developerFieldDefinition[i] = new DeveloperFieldDescription(byteZero, byteOne, byteTwo);
            }            
        }
    }
    else // Data Message
    {
        //TODO implement
        //TOOD currently skip over data, according to the field definitions
        
        //TODO currently, in the test file, the current field definition is just 2 field with total size 3 bytes
        pos += 3;
        record.numberOfDataFields = 2;
        record.dataFields = new Array(record.numberOfDataFields);
          for (var i = 0; i < record.numberOfDataFields; i++) {
            record.dataFields[i] = "test//TODO";
        }      
        
    }   
    //calculate record lenght (for reading convenience)
    record.rawByteLength = pos - initialPos; 
    return record;
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

    //start at first record
    var records = new Array();
    var pos = 0;


    //use some loop with realistic condition, not just this test variable
    //From definition messages, build up a dictionary of local message types with their definitions
    //This dictionary can then be used for parsing data messages
    //TODO continue here
    while (pos < 13+4)//header.dataSize)
    {   
        //TODO use some array type
        var record = new FileRecord(dv, pos);
        //advance the position (is not autmatically done by DataView)
        pos += record.rawByteLength;
        
        records.push(record);       
    }
    return records;
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
