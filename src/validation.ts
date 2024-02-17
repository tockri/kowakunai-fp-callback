import { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"

// 入力値バリデーションのmiddleware
export const validated = (req: Request, res: Response, next: NextFunction) => {
  const error = validationResult(req)
  if (error.isEmpty()) {
    next()
  } else {
    res.status(400).send({ errors: error.array() })
  }
}
