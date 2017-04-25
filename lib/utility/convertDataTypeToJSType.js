exports.convertDataTypeToJSType = function convertDataTypeToJSType (dataType) {
  switch (dataType) {
    case 'decimal':
    case 'money':
    case 'numeric':
    case 'smallmoney':
    case 'real':
    case 'tinyint':
    case 'smallint':
    case 'mediumint':
    case 'bigint':
    case 'int':
    case 'integer':
    case 'float':
    case 'bit':
    case 'double':
    case 'binary':
      return Number
    case 'timestamp':
      return String
    case 'datetimeoffset':
    case 'smalldatetime':
    case 'datetime2':
    case 'date':
    case 'datetime':
    case 'time':
    case 'year':
      return Date
    default:
      return String
  }
}
