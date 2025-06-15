import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";


export const authMiddleware = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Token missing" });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    // Uncomment and enable this line:
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
   
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};