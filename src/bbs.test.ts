import { describe, test, expect } from "bun:test"
import { Bbs_ForTest, MessageNode } from "./bbs"
import { MessageDao, Prisma } from "@prisma/client"

const bbs = Bbs_ForTest

// MessageDaoオブジェクトを短いコードで作るテスト用関数
const testMes = (id: number, date: number, parentId?: number): MessageDao => ({
  id,
  content: `message=${id}`,
  createdAt: new Date(2020, 1, date),
  parentId: parentId || null
})
const message1 = testMes(1, 1)
const message2 = testMes(2, 2)
const message3 = testMes(3, 3, 1)
const message4 = testMes(4, 4, 3)
const message5 = testMes(5, 5, 1)

// MessageNodeオブジェクトを短いコードで作るテスト用関数
const testNode = (m: MessageDao, ...children: MessageNode[]): MessageNode => ({
  ...m,
  children
})
const node1Empty = testNode(message1)
const node2 = testNode(message2)
const node4 = testNode(message4)
const node3 = testNode(message3, node4)
const node5 = testNode(message5)
const node1Tree = testNode(message1, node3, node5)

describe("bbs#indexLogic", () => {
  test("simple query", async () => {
    const [view, params] = await bbs.indexLogic("test", (args) => {
      expect(args).toStrictEqual({
        where: {
          content: {
            contains: "test"
          }
        },
        orderBy: { id: Prisma.SortOrder.asc }
      })
      return Promise.resolve([message1, message2])
    })
    expect(view).toBe("index")
    expect(params).toStrictEqual({
      query: "test",
      messages: [node1Empty, node2]
    })
  })

  test("empty query", async () => {
    const [view, params] = await bbs.indexLogic(undefined, (args) => {
      expect(args).toStrictEqual({
        where: undefined,
        orderBy: { id: Prisma.SortOrder.asc }
      })
      return Promise.resolve([message1, message2])
    })
    expect(view).toBe("index")
    expect(params).toStrictEqual({
      query: undefined,
      messages: [node1Empty, node2]
    })
  })

  test("empty query 2", async () => {
    const [view, params] = await bbs.indexLogic("", (args) => {
      expect(args).toStrictEqual({
        where: undefined,
        orderBy: { id: Prisma.SortOrder.asc }
      })
      return Promise.resolve([message2, message3, message4])
    })
    expect(view).toBe("index")
    expect(params).toStrictEqual({
      query: "",
      messages: [node2, node3]
    })
  })
})

describe("bbs#buildMessageNodes", () => {
  test("empty for empty", () => {
    expect(bbs.buildMessageNodes([])).toStrictEqual([])
  })

  test("simple list", () => {
    expect(bbs.buildMessageNodes([message1, message2])).toStrictEqual([
      node1Empty,
      node2
    ])
  })

  test("depth 1 tree", () => {
    expect(bbs.buildMessageNodes([message2, message3, message4])).toStrictEqual(
      [node2, node3]
    )
  })

  test("depth 2 tree", () => {
    expect(
      bbs.buildMessageNodes([message1, message2, message3, message4, message5])
    ).toStrictEqual([node1Tree, node2])
  })
})

describe("bbs#makeCreateArgsForPostMessage", () => {
  test("empty parent", () => {
    expect(
      bbs.makeCreateArgsForPostMessage({ content: "test", parentId: "" })
    ).toStrictEqual({
      data: { content: "test", parentId: null }
    })
  })

  test("set parentId", () => {
    expect(
      bbs.makeCreateArgsForPostMessage({ content: "test", parentId: "10" })
    ).toStrictEqual({
      data: { content: "test", parentId: 10 }
    })
  })

  test("set non-numeric parentId", () => {
    expect(
      bbs.makeCreateArgsForPostMessage({ content: "test", parentId: "10a" })
    ).toStrictEqual({
      data: { content: "test", parentId: null }
    })
  })
})
