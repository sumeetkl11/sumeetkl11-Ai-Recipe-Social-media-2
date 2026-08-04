import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        
        if (!token) {
            const authHeader = req.header("Authorization");
            if (authHeader?.startsWith("Bearer ")) {
                token = authHeader.replace("Bearer ", "");
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No authentication token, access denied"
            });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload, please log in again."
            });
        }

        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        
        if (!token) {
            const authHeader = req.header("Authorization");
            if (authHeader?.startsWith("Bearer ")) {
                token = authHeader.replace("Bearer ", "");
            }
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.id) {
                req.user = {
                    id: decoded.id,
                    email: decoded.email
                };
            }
        }
    } catch {
        // Optional auth: ignore invalid tokens cleanly
    }
    next();
};

export default authMiddleware;
