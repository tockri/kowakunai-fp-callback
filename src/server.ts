import express from "express"
import bbs from "./bbs"
import bodyParser from "body-parser"
import cookie from "cookie-parser"

const app = express()
const port = 8080

app.use(cookie())
app.use(bodyParser.urlencoded({ extended: true }))
app.use("/", bbs)

app.set("view engine", "ejs")

app.listen(port, () => {
  console.log(`Listening on port ${port}...`)
})
