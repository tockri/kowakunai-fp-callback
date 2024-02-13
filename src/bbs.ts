import express from "express"
import { MessageDao, Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const router = express.Router()

type MessageNode = MessageDao & {
  children: MessageNode[]
}

router.get("/", async (req, res) => {
  const messageList = await prisma.messageDao.findMany({
    orderBy: { id: Prisma.SortOrder.asc }
  })

  const nodeMap: Map<number, MessageNode> = new Map()
  for (const message of messageList) {
    nodeMap.set(message.id, { ...message, children: [] })
  }

  const messages: MessageNode[] = []
  for (const node of nodeMap.values()) {
    if (node.parentId) {
      nodeMap.get(node.parentId)?.children.push(node)
    } else {
      messages.push(node)
    }
  }

  res.render("index", { messages })
})

type PostBody = {
  content: string
  parentId: string
}

router.post("/post", async (req, res) => {
  const body = req.body as PostBody
  const data = {
    content: body.content,
    parentId: body.parentId ? parseInt(body.parentId) : null
  }
  await prisma.messageDao.create({
    data
  })

  res.render("redirect")
})

export default router
