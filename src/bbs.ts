import express from "express"
import { MessageDao, Prisma, PrismaClient } from "@prisma/client"
import { body, validationResult } from "express-validator"

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

type MessageNode = MessageDao & {
  children: MessageNode[]
}

router.get("/", async (req, res) => {
  // ログインチェック
  if (req.cookies.loggedIn !== "true") {
    res.redirect("/login")
    return
  }

  // 検索文字列
  const query = req.query.query as string | undefined

  // DBからレコード一覧を取得
  const messageList = await prisma.messageDao.findMany({
    where: query
      ? {
          content: {
            contains: query
          }
        }
      : undefined,
    orderBy: { id: Prisma.SortOrder.asc }
  })

  // ツリーに変換する前準備
  const nodeMap: Map<number, MessageNode> = new Map()
  for (const message of messageList) {
    nodeMap.set(message.id, { ...message, children: [] })
  }

  // ツリー構造にする
  const messages: MessageNode[] = []
  for (const node of nodeMap.values()) {
    const parent = (node.parentId && nodeMap.get(node.parentId)) || null
    if (parent) {
      parent.children.push(node)
    } else {
      messages.push(node)
    }
  }

  // Viewに渡す
  res.render("index", { messages, query })
})

type PostBody = {
  content: string
  parentId: string
}

router.post(
  "/post",
  body("content").exists(),
  body("parentId").matches(/^\d*$/),
  async (req, res) => {
    // ログインチェック
    if (req.cookies.loggedIn !== "true") {
      res.redirect("/login")
      return
    }

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
