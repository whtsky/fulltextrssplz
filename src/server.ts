import app from './app'
const port = process.env.PORT || 3000
const hostname = process.env.HOSTNAME || '0.0.0.0'

app.listen(Number(port), hostname, () => console.log(`Example app listening at http://${hostname}:${port}`))
