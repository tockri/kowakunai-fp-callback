import { Request, Response } from "express"

export const authenticated =
  (callback: (req: Request, res: Response) => Promise<void> | void) =>
  async (req: Request, res: Response): Promise<void> => {
    if (req.cookies.loggedIn === "true") {
      await callback(req, res)
    } else {
      res.redirect("/login")
    }
  }
