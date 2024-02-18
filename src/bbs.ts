import express from "express"
import { MessageDao, Prisma, PrismaClient } from "@prisma/client"
import { body } from "express-validator"
import { authenticated } from "./authentication"
import { validated } from "./validation"
import { pipeAsync } from "./pipeAsync"

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

router.get("/", authenticated, (req, res) =>
  pipeAsync(
    req.query.query as string | undefined,
    indexLogic(prisma.messageDao.findMany),
    (result) => res.render(...result)
  )
)

type IndexLogicResult = [
  string,
  {
    messages: MessageNode[]
    query: string | undefined
  }
]

const indexLogic =
  (findMany: (args: Prisma.MessageDaoFindManyArgs) => Promise<MessageDao[]>) =>
  (query: string | undefined): Promise<IndexLogicResult> =>
    pipeAsync(
      query,
      makeFindManyArgsForMessageList,
      findMany,
      buildMessageNodes,
      (messages) => ["index", { messages, query }]
    )

/**
 * @param query req.query.query
 * @returns prisma.messageDao.findManyの引数
 */
const makeFindManyArgsForMessageList = (
  query: string | undefined
): Prisma.MessageDaoFindManyArgs => ({
  where: query
    ? {
        content: {
          contains: query
        }
      }
    : undefined,
  orderBy: { id: Prisma.SortOrder.asc }
})

/**
 * @param messageList DBから取得した配列
 * @returns ツリー構造
 */
const buildMessageNodes = (messageList: MessageDao[]): MessageNode[] => {
  console.log({ messageList })
  const nodeMap: Map<number, MessageNode> = new Map<number, MessageNode>()
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

interface PostBody {
  readonly content: string
  readonly parentId: string
}

router.post(
  "/post",
  body("content").exists(),
  body("parentId").matches(/^\d*$/),
  authenticated,
  validated,
  (req, res) =>
    pipeAsync(
      req.body as PostBody,
      makeCreateArgsForPostMessage,
      prisma.messageDao.create,
      () => res.redirect("/")
    )
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
  buildMessageNodes,
  indexLogic,
  makeCreateArgsForPostMessage
}
