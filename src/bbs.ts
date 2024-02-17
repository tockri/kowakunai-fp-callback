import express from "express"
import { Request } from "express"
import { MessageDao, Prisma, PrismaClient } from "@prisma/client"
import { body, validationResult } from "express-validator"
import { authenticated } from "./authentication"
import { validated } from "./validation"

const prisma = new PrismaClient()

const router = express.Router()

router.get("/login", (req, res) => {
  if (req.cookies.loggedIn === "true") {
    res.redirect("/")
  } else {
    res.render("login")
  }
})

router.post("/login", (req, res) => {
  res.cookie("loggedIn", "true", {
    maxAge: 1000 * 5 * 60,
    path: "/",
    httpOnly: true
  })
  res.redirect("/")
})

router.get("/logout", (req, res) => {
  res.cookie("loggedIn", "", {
    expires: new Date("1970-01-01 00:00:00"),
    path: "/",
    httpOnly: true
  })
  res.redirect("/login")
})

export type MessageNode = MessageDao & {
  children: MessageNode[]
}

router.get("/", authenticated, async (req, res) =>
  indexLogic(
    req.query.query as string | undefined,
    prisma.messageDao.findMany
  ).then(([view, params]) => res.render(view, params))
)

const indexLogic = async (
  query: string | undefined,
  findMany: (args: Prisma.MessageDaoFindManyArgs) => Promise<MessageDao[]>
): Promise<
  [string, { messages: MessageNode[]; query: string | undefined }]
> => {
  const messageList = await findMany(makeFindManyArgsForMessageList(query))
  const messages = buildMessageNodes(messageList)
  return ["index", { messages, query }]
}

/**
 * @param query req.query.query
 * @returns prisma.messageDao.findManyの引数
 */
const makeFindManyArgsForMessageList = (
  query: string | undefined
): Prisma.MessageDaoFindManyArgs => {
  return {
    where: query
      ? {
          content: {
            contains: query
          }
        }
      : undefined,
    orderBy: { id: Prisma.SortOrder.asc }
  }
}

/**
 * @param messageList DBから取得した配列
 * @returns ツリー構造
 */
const buildMessageNodes = (messageList: MessageDao[]): MessageNode[] => {
  const nodeMap: Map<number, MessageNode> = new Map()
  for (const message of messageList) {
    nodeMap.set(message.id, { ...message, children: [] })
  }

  // ツリー構造にする
  const nodes: MessageNode[] = []
  for (const node of nodeMap.values()) {
    const parent = (node.parentId && nodeMap.get(node.parentId)) || null
    if (parent) {
      parent.children.push(node)
    } else {
      nodes.push(node)
    }
  }
  return nodes
}

type PostBody = {
  content: string
  parentId: string
}

router.post(
  "/post",
  body("content").exists(),
  body("parentId").matches(/^\d*$/),
  authenticated,
  validated,
  async (req, res) => {
    const body = req.body as PostBody
    await prisma.messageDao.create(makeCreateArgsForPostMessage(body))
    res.redirect("/")
  }
)

const makeCreateArgsForPostMessage = (
  body: PostBody
): Prisma.MessageDaoCreateArgs => {
  const data = {
    content: body.content,
    parentId:
      (body.parentId &&
        body.parentId.match(/^\d+$/) &&
        parseInt(body.parentId)) ||
      null
  }
  return { data }
}

export default router

export const Bbs_ForTest = {
  makeFindManyArgsForMessageList,
  buildMessageNodes,
  indexLogic,
  makeCreateArgsForPostMessage
}
