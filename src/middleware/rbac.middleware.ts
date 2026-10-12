import type { Request,Response,NextFunction } from "express";
import type { AuthPayload } from "../lib/auth.js";
type Role = AuthPayload["role"];

export function authorizeRoles(...allowedRoles:Role[]){
return(req:Request,res:Response,next:NextFunction):void =>{
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

     if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
      return;
    }
    next();
}
}