import User from "../models/User.js";
import UserPreference from "../models/UserPreference.js";
import jwt from "jsonwebtoken";
import { isAdminEmail } from "../middleware/admin.js";
import { ensureDefaultRecipesForUser } from "../utils/defaultRecipes.js";

// Generate JWT token (expects a user object)
const generateToken = (user) => {
    // the `user` parameter should be a record returned from the database
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

// Register user
export const register = async (req, res, next) => {
    try {
        const {email, name, password} = req.body;

        // validation
        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // create user
        const user = await User.create({ email, name, password });

        // create default preferences (pass the new user's id)
        // await UserPreference.create(user.id, {
        //     dietary_restrictions: [],
        //     allergies: [],
        //     preferred_cuisines: [],
        //     default_servings: 4,
        //     measurement_unit: "metric",
        // });

        await UserPreference.create(user.id, {
            dietary_restrictions: [],
            allergens: [],
            preference_cuisine: [],
            default_servings: 4,
            measurement_system: "metric",
        });

        await ensureDefaultRecipesForUser(user.id);

        // generate token
        const token = generateToken(user);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar_url: user.avatar_url,
                    isAdmin: isAdminEmail(user.email)
                },
                token
            }
        });
        
    } catch (error) {
        next(error);
    }
}


// login user
export const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        // validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // find user
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // verify password using the static helper
        const isPasswordValid = await User.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // generate token
        const token = generateToken(user);
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar_url: user.avatar_url,
                    isAdmin: isAdminEmail(user.email)
                },
                token
            }
        });
        
    } catch (error) {
        next(error);
    }
}

// get current user
export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        const preferences = await UserPreference.findByUserId(req.user.id);
        
        res.json({
                success: true,
                // message: "User fetched successfully",
                data: {
                    user: {
                        ...user,
                        isAdmin: isAdminEmail(user.email)
                    },
                    preferences
                }
            });
        
    } catch (error) {
        next(error);
    }
}

// request password reset
export const requestPasswordReset = async (req, res, next) => {
    try {
        const {email} = req.body;

        // validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // find user
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // this feature uses methods that aren't implemented in the simple SQL model
        // just return a not‑implemented response for now
        return res.status(501).json({
            success: false,
            message: "Password reset is not implemented yet"
        });
        
    } catch (error) {
        next(error);
    }
}
