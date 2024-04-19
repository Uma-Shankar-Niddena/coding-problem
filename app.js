const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasepath = path.join(__dirname, 'todoApplication.db')
let db = null
const initilizesqlandServer = async () => {
  try {
    db = await open({
      filename: databasepath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('serverStarted.. enjoy pandagow...!')
    })
  } catch (e) {
    console.log(`DB error ${e.message}`)
  }
}
initilizesqlandServer()
const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}
///GET whose status is Do
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

///GET specific todo
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `SELECT * FROM todo WHERE id=${todoId}`
  const resfromdb = await db.get(query)
  response.send(resfromdb)
})

/// POST Todo
app.post('/todos/', async (request, response) => {
  const todoDetails = request.body
  const {id, todo, priority, status} = todoDetails
  const queryforpost = `INSERT INTO todo(id,todo,priority,status) VALUES(${id},"${todo}","${priority}","${status}")`
  const resfromdb = await db.run(queryforpost)
  response.send('Todo Successfully Added')
})

/// PUT todes according to todoid
const hasstatus = requesttodesId => {
  return
}
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let queryforput = ''
  let responsevales = ''
  const requestBody = request.body

  switch (true) {
    case requestBody.status !== undefined:
      responsevales = 'Status'
      break
    case requestBody.todo !== undefined:
      responsevales = 'Todo'
      break
    case requestBody.priority !== undefined:
      responsevales = 'Priority'
      break
  }
  const previoustodo = `SELECT 
  * FROM todo where id=${todoId}`

  const resfromdb = await db.run(previoustodo)

  const {
    todo = resfromdb.todo,
    status = resfromdb.status,
    priority = resfromdb.priority,
  } = request.body

  const finalquery = `UPDATE todo SET todo="${todo}", status="${status}",priority="${priority}"`
  const findalres = await db.run(finalquery)

  response.send(`${responsevales} Updated`)
})

///DELETE
app.delete('todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `DELETE FROM todo WHERE id=${todoId}`
  const resfromdb = await db.run(query)
  response.send('Todo Deleted')
})
