# garmin-sports
Original and modified sports FIT files from a Garmin Forerunner 235 sports watch

# JavaScript parser
Parses a FIT file of the "Sports" type into a JavaScript object.

The following objects exist //TODO
* FitFile, a complete FIT file
  * FitFileHeader, the header of a FIT file
  * FitFileDataRecords, the data content of a FIT file
    * FitRecord, a single item of FIT data
      * FitRecordHeader
      * FitRecordContent, which is either
        * FitDefinitionMessage
        * FitDataMessage
  * FitFileCrc, the CRC of a FIT file
