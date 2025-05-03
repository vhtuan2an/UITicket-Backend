const UserService = require("../services/UserService");

class UserController {
    async getUsers(req, res) {
        const { role } = req.query;
        try {
            const users = await UserService.getUsers(role);
            res.status(200).json({
                status: "success",
                message: "Get users successfully",
                data: users,
            })
        }
        catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error",
                error: error.toString(),
            });
        }
    }

    async getUserById(req, res) {
        const { id } = req.params;
        try {
            const user = await UserService.getUserById(id);
            res.status(200).json({
                status: "success",
                message: "Get user successfully",
                data: user,
            })
        }
        catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error",
                error: error.toString(),
            });
        }
    }

    async searchUsers(req, res) {
        const { query } = req.query;
        const { role } = req.query;
        const userId = req.id; 
        try {
            if (!query) {
                return res.status(422).json({
                    status: "error",
                    message: "Query is required",
                });
            }
            const users = await UserService.searchUsers(query, role, userId);
            res.status(200).json({
                status: "success",
                message: "Search users successfully",
                data: users,
            })
        }
        catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error",
                error: error.toString(),
            });
        }
    }

}