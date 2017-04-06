var _ = require('lodash')
var sql = require('mssql')

exports.upsert = function (Model, id, doc, callback) {
  var self = this
  var request = new sql.Request(self.connection)

  if (!id || !doc) {
    throw new Error('You must provide a Model id and data Object, that will be persisted')
  }

  var table = this.getTableName(Model)
  var columns = _.keys(doc)
  var placeholders = columns.map(function (key) { return '@' + key })

  Model.findByID(id, function (err, result) {
    if (err) {
      callback(err)
    } else {
      if (result === undefined) {
        var onQuery = 'SET IDENTITY_INSERT ' + table + ' ON'

        request.batch(onQuery, function (err, result) {
          if (err) {
            return callback(err)
          } else {
            var insertQuery = 'INSERT INTO ' + table + ' (' + columns.join(',') + ') OUTPUT INSERTED.* VALUES (' + placeholders.join(',') + ')'
            self.addValuesToSQLRequest(Model, doc, request, true)

            request.query(insertQuery, function upsertQueryCallback (err, result) {
              if (err) {
                return callback(err)
              } else {
                var offQuery = 'SET IDENTITY_INSERT ' + table + ' OFF'

                request.batch(offQuery, function upsertBatchCallback (err, result) {
                  if (err) {
                    return callback(err)
                  }
                })

                var instance = Model.instance(result, true)
                instance.setPrimaryKey(id)
                callback(null, instance)
              }
            })
          }
        })
      } else {
        var updateQuery = 'UPDATE ' + table + ' SET'

        for (var key in doc) {
          if (key !== 'id' && key !== 'ID') {
            updateQuery += ' ' + `${key}` + ' = '
            if ((typeof doc[key]) === 'string') {
              updateQuery += `'${doc[key]}'` + ', '
            } else updateQuery += `${doc[key]}` + ', '
          }
        }

        updateQuery = updateQuery.slice(0, -2)
        updateQuery += ' WHERE ID = ' + doc.id

        request.query(updateQuery, function upsertQueryCallback (err, result) {
          if (err) {
            return callback(err)
          } else {
            var instance = Model.instance(doc, true)
            instance.setPrimaryKey(doc.id)
            callback(null, instance)
          }
        })
      }
    }
  })
}
