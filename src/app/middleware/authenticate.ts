import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../../config";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Check Authorization header first, then cookie
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized. Please login." });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden. Admin access required." });
  }
  next();
};
