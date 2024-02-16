import { Request, Response, NextFunction } from "express"

export const authenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.cookies.loggedIn === "true") {
    next()
  } else {
    res.redirect("/login")
  }
}
