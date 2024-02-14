import { describe, test, expect } from "bun:test"
import { Bbs_ForTest, MessageNode } from "./bbs"
import { MessageDao, Prisma } from "@prisma/client"

const bbs = Bbs_ForTest

describe("bbs#makeFindManyArgsForMessageList", () => {
  test("make args with query", () => {
    expect(bbs.makeFindManyArgsForMessageList("test")).toStrictEqual({
      where: {
        content: {
          contains: "test"
        }
      },
      orderBy: { id: Prisma.SortOrder.asc }
    })
  })

  test("make args with empty query", () => {
    expect(bbs.makeFindManyArgsForMessageList("")).toStrictEqual({
      where: undefined,
      orderBy: { id: Prisma.SortOrder.asc }
    })
    expect(bbs.makeFindManyArgsForMessageList(undefined)).toStrictEqual({
      where: undefined,
      orderBy: { id: Prisma.SortOrder.asc }
    })
  })
})

describe("bbs#buildMessageNodes", () => {
  test("empty for empty", () => {
    expect(bbs.buildMessageNodes([])).toStrictEqual([])
  })

  // MessageDaoオブジェクトを短いコードで作るテスト用関数
  const testMes = (
    id: number,
    date: number,
    parentId?: number
  ): MessageDao => ({
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
  const testNode = (
    m: MessageDao,
    ...children: MessageNode[]
  ): MessageNode => ({ ...m, children })
  const node1Empty = testNode(message1)
  const node2 = testNode(message2)
  const node4 = testNode(message4)
  const node3 = testNode(message3, node4)
  const node5 = testNode(message5)
  const node1Tree = testNode(message1, node3, node5)

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
