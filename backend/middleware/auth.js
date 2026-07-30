import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) =>{
    try {
        // Try to get token from cookie first, fallback to Authorization header for backward compatibility
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

        // ADD user info to request
        req.user ={
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

export default authMiddleware;
