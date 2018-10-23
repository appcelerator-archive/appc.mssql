const test = require('tap').test
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
const sql = require('mssql')
const server = require('./../../server.js')
const addValuesToSQLRequest = require('../../../lib/utility/addValuesToSQLRequest').addValuesToSQLRequest
var ARROW
var CONNECTOR

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      ARROW = inst
      CONNECTOR = ARROW.getConnector('appc.mssql')
      t.ok(ARROW, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### Test Connect method success case (stringType != timestamp) ###', testWrap(function (t) {
  // Data
  const model = {}
  const values = { 'title': '', 'content': '' }

  // Mocks, stubs & spies
  const getTableSchemaStub = this.stub(CONNECTOR, 'getTableSchema').callsFake(function (model) {
    return {
      title: {
        DATA_TYPE: 'VarChar',
        CHARACTER_MAXIMUM_LENGTH: 255
      },
      content: {
        DATA_TYPE: 'Varchar',
        CHARACTER_MAXIMUM_LENGTH: 255
      }
    }
  })
  const loggerTraceStub = this.stub(CONNECTOR.logger, 'trace').callsFake(function (message) { })

  const request = { input: () => { } }
  const requestInputStub = this.stub(request, 'input').callsFake(function (name, type, value) { })

  const sqlMock = this.mock(sql)
  sqlMock.expects('VarChar').withExactArgs(255).exactly(4).returnsThis({
    type: 'VarChar',
    length: 255
  })

  addValuesToSQLRequest.bind(CONNECTOR, model, values, request, false)()

  t.ok(getTableSchemaStub.calledOnce)
  t.ok(loggerTraceStub.calledTwice)
  t.ok(requestInputStub.calledTwice)
  t.ok(requestInputStub.calledWith('title'))
  t.ok(requestInputStub.calledWith('content'))
  sqlMock.verify()

  t.end()
}))

test('### Test Connect method success case (stringType = timestamp, excludeTimestamp = false) ###', testWrap(function (t) {
  // Data
  const model = {}
  const values = { 'title': '', 'content': '' }

  // Mocks, stubs & spies
  const getTableSchemaStub = this.stub(CONNECTOR, 'getTableSchema').callsFake(function (model) {
    return {
      title: {
        DATA_TYPE: 'TimeStamp',
        CHARACTER_MAXIMUM_LENGTH: 255
      },
      content: {
        DATA_TYPE: 'Varchar',
        CHARACTER_MAXIMUM_LENGTH: 255
      }
    }
  })
  const loggerTraceStub = this.stub(CONNECTOR.logger, 'trace').callsFake(function (message) { })

  const request = { input: () => { } }
  const requestInputStub = this.stub(request, 'input').callsFake(function (name, type, value) { })

  const sqlMock = this.mock(sql)
  sqlMock.expects('VarChar').withExactArgs(255).exactly(3).returnsThis({
    type: 'VarChar',
    length: 255
  })
  sqlMock.expects('VarBinary').withExactArgs(8).once().returnsThis({
    type: 'VarBinary',
    length: 8
  })

  addValuesToSQLRequest.bind(CONNECTOR, model, values, request, false)()

  t.ok(getTableSchemaStub.calledOnce)
  t.ok(loggerTraceStub.calledTwice)
  t.ok(requestInputStub.calledTwice)
  t.ok(requestInputStub.calledWith('title'))
  t.ok(requestInputStub.calledWith('content'))
  sqlMock.verify()

  t.end()
}))

test('### Test Connect method success case (stringType = timestamp, excludeTimestamp = true) ###', testWrap(function (t) {
  // Data
  const model = {}
  const values = { 'title': '', 'content': '' }

  // Mocks, stubs & spies
  const getTableSchemaStub = this.stub(CONNECTOR, 'getTableSchema').callsFake(function (model) {
    return {
      title: {
        DATA_TYPE: 'TimeStamp',
        CHARACTER_MAXIMUM_LENGTH: 255
      },
      content: {
        DATA_TYPE: 'Varchar',
        CHARACTER_MAXIMUM_LENGTH: 255
      }
    }
  })
  const loggerTraceStub = this.stub(CONNECTOR.logger, 'trace').callsFake(function (message) { })

  const request = { input: () => { } }
  const requestInputStub = this.stub(request, 'input').callsFake(function (name, type, value) { })

  const sqlMock = this.mock(sql)
  sqlMock.expects('VarChar').withExactArgs(255).exactly(3).returnsThis({
    type: 'VarChar',
    length: 255
  })

  addValuesToSQLRequest.bind(CONNECTOR, model, values, request, true)()

  t.ok(getTableSchemaStub.calledOnce)
  t.ok(loggerTraceStub.calledOnce)
  t.ok(requestInputStub.calledOnce)
  sqlMock.verify()

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
