// import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

// export const errorHandler: ErrorRequestHandler = (error, req: Request, res: Response, next: NextFunction) => {
//   console.error("Error:", error);

//   if (error?.statusCode) {
//     return res.status(error.statusCode).json({ error: error.message });
//   }

//   res.status(500).json({ error: "Internal server error" });
// };
