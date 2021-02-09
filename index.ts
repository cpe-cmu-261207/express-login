import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.SECRET_KEY as string
const PORT = process.env.PORT || 3000

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
  const hashPassword = bcrypt.hashSync(body.password, 10)
  db.users.push({
    ...body,
    id: Date.now(),
    password: hashPassword,
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
  if (!bcrypt.compareSync(body.password, user.password)) {
    res.status(400)
    res.json({ message: 'Invalid username or password' })
    return
  }
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY)
  res.json({ token })
})

app.get('/secret', (req, res) => {
  const token = req.headers.authorization
  if (!token) {
    res.status(401)
    res.json({ message: 'Require authorization header'})
    return
  }
  try {
    const data = jwt.verify(token.split(" ")[1], SECRET_KEY)
    res.json(data)
  } catch(e) {
    res.status(401)
    res.json({ message: e.message })
  }
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))