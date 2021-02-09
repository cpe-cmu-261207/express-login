import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.json({ message: 'Hello world' })
})

app.listen(8000, () => console.log('Server is running at 8000'))