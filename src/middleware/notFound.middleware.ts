import { Request, Response } from "express";
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `The path ${req.originalUrl} does not exist on this server.`,
    path: req.originalUrl,
  });
};
