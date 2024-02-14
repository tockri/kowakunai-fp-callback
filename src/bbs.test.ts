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

  const message1: MessageDao = {
    id: 1,
    content: "message-1",
    createdAt: new Date(2020, 1, 1),
    parentId: null
  }
  const message2: MessageDao = {
    id: 2,
    content: "message-2",
    createdAt: new Date(2020, 1, 2),
    parentId: null
  }
  const message3: MessageDao = {
    id: 3,
    content: "message-3",
    createdAt: new Date(2020, 1, 3),
    parentId: 1
  }
  const message4: MessageDao = {
    id: 4,
    content: "message-4",
    createdAt: new Date(2020, 1, 4),
    parentId: 3
  }
  const node1Empty: MessageNode = { ...message1, children: [] }
  const node2: MessageNode = { ...message2, children: [] }
  const node4: MessageNode = { ...message4, children: [] }
  const node3: MessageNode = { ...message3, children: [node4] }
  const node1Children: MessageNode = { ...message1, children: [node3] }

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
      bbs.buildMessageNodes([message1, message2, message3, message4])
    ).toStrictEqual([node1Children, node2])
  })
})
