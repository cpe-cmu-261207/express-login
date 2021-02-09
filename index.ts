import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'

const app = express()
app.use(bodyParser.json())

interface DbSchema {
  users: User[]
}

interface User {
  id: number
  username: string
  password: string
}

app.get('/', (req, res) => {
  res.json({ message: 'Hello world' })
})

type RegisterArgs = Omit<User, 'id'>

app.post<any, any, RegisterArgs>('/register', (req, res) => {
  const body = req.body
  const raw = fs.readFileSync('db.json', 'utf8')
  const db: DbSchema = JSON.parse(raw)
  db.users.push({
    ...body,
    id: Date.now()
  })
  fs.writeFileSync('db.json', JSON.stringify(db))
  res.json({ message: 'Register complete' })
})

type LoginArgs = Pick<User, 'username' | 'password'>

app.post<any, any, LoginArgs>('/login', (req, res) => {
  const body = req.body
  const raw = fs.readFileSync('db.json', 'utf8')
  const db: DbSchema = JSON.parse(raw)
  const user = db.users.find(user => user.username === body.username)
  if (!user) {
    res.status(400)
    res.json({ message: 'Invalid username or password' })
    return
  }
  if (user.password !== body.password) {
    res.status(400)
    res.json({ message: 'Invalid username or password' })
    return
  }
  res.json(user)
})

app.listen(8000, () => console.log('Server is running at 8000'))