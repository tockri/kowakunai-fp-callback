import express from "express"
import { Request } from "express"
import { MessageDao, Prisma, PrismaClient } from "@prisma/client"
import { body, validationResult } from "express-validator"
import { authenticated } from "./authentication"

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

router.get("/", authenticated, async (req, res) => {
  // 検索文字列
  const query = req.query.query as string | undefined

  // DBからレコード一覧を取得
  const messageList = await prisma.messageDao.findMany(
    makeFindManyArgsForMessageList(query)
  )

  // ツリー構造にする
  const messages = buildMessageNodes(messageList)

  // Viewに渡す
  res.render("index", { messages, query })
})

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
  async (req, res) => {
    // 入力値バリデーション
    const error = validationResult(req)
    if (!error.isEmpty()) {
      res.status(400).send({ errors: error.array() })
      return
    }

    const body = req.body as PostBody

    // DBに登録
    const data = {
      content: body.content,
      parentId:
        (body.parentId &&
          body.parentId.match(/^\d+$/) &&
          parseInt(body.parentId)) ||
        null
    }
    await prisma.messageDao.create({
      data
    })

    // レスポンス
    res.redirect("/")
  }
)

export default router

export const Bbs_ForTest = {
  makeFindManyArgsForMessageList,
  buildMessageNodes
}
