import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
//to do(need to enable after the user model is merged
//import { User } from "../models/User";

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    //to do(need to enable after the user model is merged
   // req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
