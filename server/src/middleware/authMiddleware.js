import jwt from "jsonwebtoken";
import envConfig from "../config/envConfig.js";

export const authMiddleware = (req, res, next) => {
    try {
        // get the token
        const token = req.cookies.token;

        // check the if token exist
        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Acess denied. No token is provided."
            });
        }

        // verify the token
        const decode = jwt.verify(
            token,
            envConfig.JWT_SECRET
        );
         // 4. Attach user info to request

         req.user = {
            userId: decode.userId
        };

        // 5. Continue
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
    };
