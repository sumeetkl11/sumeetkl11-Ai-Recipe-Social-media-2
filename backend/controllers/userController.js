import User from "../models/User.js";
import UserPreference from "../models/UserPreference.js";

// get user profile
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const preferences = await UserPreference.findByUserId(req.user.id);

        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            data: {user, preferences}
        });
        
    } catch (error) {
        next(error);
    }
}


// update user profile
export const updateProfile = async (req, res, next) => {
    try {
        const { name, email, avatar_url } = req.body;
        const user = await User.update(req.user.id, { name, email, avatar_url });

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {user}
        });
        
    } catch (error) {
        next(error);
    }
}


// update user preferences
export const updatePreferences = async (req, res, next) => {
    try {
        const preferences = await UserPreference.create(req.user.id, req.body);
        
        res.json({
            success: true,
            message: "Preferences updated successfully",
            data: {preferences}
        });
        
    } catch (error) {
        next(error);
    }
}

// change password

export const changePassword = async (req, res, next) => {
    try {
        const {currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        // get user and verify current password
        const user = await User.findById(req.user.id);
        const isValid = await User.verifyPassword(currentPassword, user.password);
        if(!isValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // update password
        await User.updatePassword(req.user.id, newPassword);

        res.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        next(error);
    }
}

// dlt account
export const deleteAccount = async (req, res, next) => {
    try {
        await User.delete(req.user.id);
        
        res.json({
            success: true,
            message: "Account deleted successfully"
        });
        
    } catch (error) {
        next(error);
    }
}
