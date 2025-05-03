const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    async createUser(userData) {
        try {
            console.log("Received userData:", userData);
            const { email, password, name, role } = userData;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return {
                    status: "error",
                    message: "Email already exists",
                };
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const newUser = await User.create({
                email,
                password: hashedPassword,
                name,
                role
            });

            return {
                status: "success",
                message: "User created successfully",
                data: {
                    _id: newUser._id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async loginUser(email, password) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return {
                    status: "error",
                    message: "User not found",
                };
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    status: "error",
                    message: "Invalid password",
                };
            }

            const accessToken = jwt.sign(
                { id: user._id, role: user.role },
                process.env.ACCESS_TOKEN,
                { expiresIn: "1d" }
            );

            user.accessToken = accessToken;
            await user.save();

            return {
                status: "success",
                message: "Login successful",
                data: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    accessToken: accessToken,
                },                
            };
        } catch (error) {
            throw error;
        }
    }

    async resetPassword(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }

            // Tạo mật khẩu mới ngẫu nhiên
            const newPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Cập nhật mật khẩu mới
            user.password = hashedPassword;
            await user.save();

            return {
                message: "Password has been reset. Please check your email.",
                newPassword // Trong thực tế, bạn sẽ gửi mật khẩu qua email
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthService();