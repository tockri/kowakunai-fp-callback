import { Request, Response } from "express"

export const authenticated = async <P, ResBody, ReqBody, ReqQuery>(
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response,
  callback: () => Promise<void> | void
): Promise<void> => {
  if (req.cookies.loggedIn === "true") {
    await callback()
  } else {
    res.redirect("/login")
  }
}
