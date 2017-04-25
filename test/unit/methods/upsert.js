const test = require('tap').test
const sinon = require('sinon')
const _ = require('lodash')
const sql = require('mssql')
const server = require('../../server')
const upsertMethod = require('../../../lib/methods/upsert').upsert
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

test('### Upsert with nonexisting ID /insert/ successful case ###', function (t) {
  // Data
  var sandbox = sinon.sandbox.create()
  const Model = ARROW.getModel('Posts')

  Model.instance = function (values, skip) {
    return {
      title: 'test',
      content: 'test content',
      toPayload () {
        return ['test', 'test content']
      },
      setPrimaryKey (id) { }
    }
  }

  const instanceTest = Model.instance({ title: 'test', content: 'test content' }, false)
  const sqlStub = sandbox.stub(
    sql,
    'Request',
    (connection) => {
      return {
        query: function (query, upsertQueryCallback) {
          setImmediate(function () { upsertQueryCallback(null, instanceTest) })
        },
        batch: function (query, upsertBatchCallback) {
          setImmediate(function () { upsertBatchCallback(null, undefined) })
        }
      }
    })

  const getTableNameStub = sandbox.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'Posts'
  })

  const _keysStub = sandbox.stub(_, 'keys', function (payload) {
    return ['title', 'content', 'id']
  })

  const addValuesToSQLRequestStub = sandbox.stub(CONNECTOR, 'addValuesToSQLRequest', function (Model, values, request, excludeTimeStamp) { })

  const findByIDStub = sandbox.stub(CONNECTOR, 'findByID', function (Model, id, findByIDCb) {
    findByIDCb(null, undefined)
  })

  const cbSpy = sandbox.spy()

  var values = {
    id: 1,
    name: 'test',
    content: 'test',
    books: []
  }

  // Execution

  upsertMethod.bind(CONNECTOR, Model, 1, values, cbSpy)()
  setImmediate(function () {
    t.ok(sqlStub.calledOnce)
    t.ok(getTableNameStub.calledOnce)
    t.ok(_keysStub.calledOnce)
    t.ok(addValuesToSQLRequestStub.calledOnce)
    t.ok(findByIDStub.calledOnce)
    sandbox.restore()
    t.end()
  })
})

test('### Upsert with nonexisting ID error case###', function (t) {
  // Data
  var sandbox = sinon.sandbox.create()
  const Model = ARROW.getModel('Posts')

  Model.instance = function (values, skip) {
    return {
      title: 'test',
      content: 'test content',
      toPayload () {
        return ['test', 'test content']
      },
      setPrimaryKey (id) { }
    }
  }

  const sqlStub = sandbox.stub(
    sql,
    'Request',
    (connection) => {
      return {
        query: function (query, upsertQueryCallback) {
          setImmediate(function () { upsertQueryCallback(null, []) })
        },
        batch: function (query, upsertBatchCallback) {
          setImmediate(function () { upsertBatchCallback('err', []) })
        }
      }
    })

  const _keysStub = sandbox.stub(_, 'keys', function (payload) {
    return ['title', 'content', 'id']
  })

  const getTableNameStub = sandbox.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'Posts'
  })

  const findByIDStub = sandbox.stub(CONNECTOR, 'findByID', function (Model, id, findByIDCb) {
    findByIDCb()
  })

  const cbSpy = sandbox.spy()

  // Execution
  var values = {
    id: 1,
    name: 'test',
    content: 'test'
  }

  upsertMethod.bind(CONNECTOR, Model, 1, values, cbSpy)()
  setImmediate(function () {
    t.ok(sqlStub.calledOnce)
    t.ok(getTableNameStub.calledOnce)
    t.ok(_keysStub.calledOnce)
    t.ok(findByIDStub.calledOnce)
    t.ok(cbSpy.calledOnce)
    t.ok(cbSpy.calledWith('err'))
    sandbox.restore()
    t.end()
  })
})

test('### Upsert with nonexisting ID error case 2 ###', function (t) {
  // Data
  var sandbox = sinon.sandbox.create()
  const Model = ARROW.getModel('Posts')

  Model.instance = function (values, skip) {
    return {
      title: 'test',
      content: 'test content',
      toPayload () {
        return ['test', 'test content']
      },
      setPrimaryKey (id) { }
    }
  }

  const sqlStub = sandbox.stub(
    sql,
    'Request',
    (connection) => {
      return {
        query: function (query, upsertQueryCallback) {
          setImmediate(function () { upsertQueryCallback('err', []) })
        },
        batch: function (query, upsertBatchCallback) {
          setImmediate(function () { upsertBatchCallback(null, []) })
        }
      }
    })

  const getTableNameStub = sandbox.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'Posts'
  })

  const _keysStub = sandbox.stub(_, 'keys', function (payload) {
    return ['title', 'content', 'id']
  })

  const addValuesToSQLRequestStub = sandbox.stub(CONNECTOR, 'addValuesToSQLRequest', function (Model, values, request, excludeTimeStamp) { })

  const findByIDStub = sandbox.stub(CONNECTOR, 'findByID', function (Model, id, findByIDCb) {
    findByIDCb()
  })

  const cbSpy = sandbox.spy()

  // Execution
  var values = {
    id: 1,
    name: 'test',
    content: 'test'
  }

  upsertMethod.bind(CONNECTOR, Model, 1, values, cbSpy)()
  setImmediate(function () {
    t.ok(sqlStub.calledOnce)
    t.ok(getTableNameStub.calledOnce)
    t.ok(_keysStub.calledOnce)
    t.ok(addValuesToSQLRequestStub.calledOnce)
    t.ok(findByIDStub.calledOnce)
    sandbox.restore()
    t.end()
  })
})

test('### Upsert error case ###', function (t) {
  // Data
  var sandbox = sinon.sandbox.create()
  const Model = ARROW.getModel('Posts')

  Model.instance = function (values, skip) {
    return {
      title: 'test',
      content: 'test content',
      toPayload () {
        return ['test', 'test content']
      },
      setPrimaryKey (id) { }
    }
  }

  const cbSpy = sandbox.spy()

  // Execution

  t.throws(upsertMethod.bind(CONNECTOR, Model, undefined, {}, cbSpy),
    'You must provide a Model id and data Object, that will be persisted')

  sandbox.restore()
  t.end()
})

test('### Upsert with findByID error ###', function (t) {
  // Data
  var sandbox = sinon.sandbox.create()
  const Model = ARROW.getModel('Posts')

  Model.instance = function (values, skip) {
    return {
      title: 'test',
      content: 'test content',
      toPayload () {
        return ['test', 'test content']
      },
      setPrimaryKey (id) { }
    }
  }

  const sqlStub = sandbox.stub(
    sql,
    'Request',
    (connection) => {
      return {
        query: function (query, upsertQueryCallback) {
          setImmediate(function () { upsertQueryCallback(null, []) })
        },
        batch: function (query, upsertBatchCallback) {
          setImmediate(function () { upsertBatchCallback(null, []) })
        }
      }
    })

  const getTableNameStub = sandbox.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'Posts'
  })

  const findByIDStub = sandbox.stub(CONNECTOR, 'findByID', function (Model, id, findByIDCb) {
    findByIDCb('err', [])
  })

  const cbSpy = sandbox.spy()

  var values = {
    id: 1,
    name: 'test',
    content: 'test'
  }

  // Execution
  upsertMethod.bind(CONNECTOR, Model, 1, values, cbSpy)()
  setImmediate(function () {
    t.ok(sqlStub.calledOnce)
    t.ok(getTableNameStub.calledOnce)
    t.ok(findByIDStub.calledOnce)
    t.ok(cbSpy.calledOnce)
    t.ok(cbSpy.calledWith('err'))
    sandbox.restore()
    t.end()
  })
})

test('### Upsert with existing ID /update/ successful case ###', function (t) {
  // Data
  var sandbox = sinon.sandbox.create()
  const Model = ARROW.getModel('Posts')

  Model.instance = function (values, skip) {
    return {
      title: 'test',
      content: 'test content',
      toPayload () {
        return ['test', 'test content']
      },
      setPrimaryKey (id) { }
    }
  }

  const sqlStub = sandbox.stub(
    sql,
    'Request',
    (connection) => {
      return {
        query: function (query, upsertQueryCallback) {
          setImmediate(function () { upsertQueryCallback(null, []) })
        },
        batch: function (query, upsertBatchCallback) {
          setImmediate(function () { upsertBatchCallback(null, []) })
        }
      }
    })

  const _keysStub = sandbox.stub(_, 'keys', function (payload) {
    return ['title', 'content', 'id']
  })

  const addValuesToSQLRequestStub = sandbox.stub(CONNECTOR, 'addValuesToSQLRequest', function (Model, values, request, excludeTimeStamp) { })

  const getTableNameStub = sandbox.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'Posts'
  })

  const findByIDStub = sandbox.stub(CONNECTOR, 'findByID', function (Model, id, findByIDCb) {
    setImmediate(function () { findByIDCb(null, { name: 'test', content: 'test' }) })
  })

  const cbSpy = sandbox.spy()

  // Execution
  var values = {
    id: 1,
    name: 'test',
    content: 'test',
    books: []
  }

  upsertMethod.bind(CONNECTOR, Model, 1, values, cbSpy)()
  setImmediate(function () {
    t.ok(sqlStub.calledOnce)
    t.ok(_keysStub.calledOnce)
    t.ok(getTableNameStub.calledOnce)
    t.ok(addValuesToSQLRequestStub.calledOnce)
    t.ok(findByIDStub.calledOnce)
    sandbox.restore()
    t.end()
  })
})

test('### Upsert with existing ID error case ###', function (t) {
  // Data
  var sandbox = sinon.sandbox.create()
  const Model = ARROW.getModel('Posts')

  Model.instance = function (values, skip) {
    return {
      title: 'test',
      content: 'test content',
      toPayload () {
        return ['test', 'test content']
      },
      setPrimaryKey (id) { }
    }
  }

  const sqlStub = sandbox.stub(
    sql,
    'Request',
    (connection) => {
      return {
        query: function (query, upsertQueryCallback) {
          setImmediate(function () { upsertQueryCallback('err', []) })
        },
        batch: function (query, upsertBatchCallback) {
          setImmediate(function () { upsertBatchCallback(null, []) })
        }
      }
    })

  const getTableNameStub = sandbox.stub(CONNECTOR, 'getTableName', function (Model) {
    return 'Posts'
  })
  const addValuesToSQLRequestStub = sandbox.stub(CONNECTOR, 'addValuesToSQLRequest', function (Model, values, request, excludeTimeStamp) { })

  const _keysStub = sandbox.stub(_, 'keys', function (payload) {
    return ['title', 'content', 'id']
  })

  const findByIDStub = sandbox.stub(CONNECTOR, 'findByID', function (Model, id, findByIDCb) {
    findByIDCb(null, { name: 'test', content: 'test' })
  })

  const cbSpy = sandbox.spy()

  // Execution
  var values = {
    id: 1,
    name: 'test',
    content: 'test',
    books: []
  }

  upsertMethod.bind(CONNECTOR, Model, 1, values, cbSpy)()
  setImmediate(function () {
    t.ok(sqlStub.calledOnce)
    t.ok(getTableNameStub.calledOnce)
    t.ok(addValuesToSQLRequestStub.calledOnce)
    t.ok(_keysStub.calledOnce)
    t.ok(findByIDStub.calledOnce)
    t.ok(cbSpy.calledOnce)
    t.ok(cbSpy.calledWith('err'))
    sandbox.restore()
    t.end()
  })
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
