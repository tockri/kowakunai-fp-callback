import express from "express"

const app = express()
const port = 8080

app.get("/", async (req, res) => {
  res.send("Hello World! then hey, DJ!")
})

app.post("/", async (req, res) => {})

app.listen(port, () => {
  console.log(`Listening on port ${port}...`)
})
