var _ = require('lodash')
var sql = require('mssql')

exports.upsert = function (Model, id, doc, callback) {
  var self = this
  var request = new sql.Request(self.connection)
  var table = this.getTableName(Model)

  if (!id || !doc) {
    throw new Error('You must provide a Model id and data Object, that will be persisted')
  }

  self.findByID(Model, id, function (err, res) {
    if (err) {
      callback(err)
    } else {
      if (res === undefined) {
        var onQuery = 'SET IDENTITY_INSERT ' + table + ' ON'
        var columns = _.keys(doc)
        var placeholders = columns.map(function (key) { return '@' + key })

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
        delete doc.id
        columns = _.keys(doc)
        placeholders = ''

        columns.map(function (item) {
          placeholders += `${item} = @${item}, `
        })
        placeholders = placeholders.slice(0, -2)

        var updateQuery = 'UPDATE ' + table + ' SET ' + placeholders + ' WHERE ID = ' + id
        self.addValuesToSQLRequest(Model, doc, request, true)

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
