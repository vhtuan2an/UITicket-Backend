const User = require("../models/UserModel");

class UserService {
    async getUsers(role) {
        try {
            const filter = {isDeleted: false};
            if (role) {
                filter.role = role;
            }

            const users = await User.find(filter)
                .select("-password -isDeleted -createdAt -updatedAt -__v")
                .populate("university", "name")
                .populate("faculty", "name")
                .populate("major", "name")
                .populate("eventsCreated", "name")
                .populate("ticketsBought", "name")
            return users;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }

    async getUserById(id) {
        try {
            const user = await User.findById(id)
            .select("-password -isDeleted -createdAt -updatedAt -__v")
            .populate("university", "name")
            .populate("faculty", "name")
            .populate("major", "name")
            .populate("eventsCreated", "name")
            .populate("ticketsBought", "name")
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async searchUsers(query, role, userId) {
        try {
            query = decodeURIComponent(query.replace(/\+/g, " "));

            const filter = {
                isDeleted: false,
                _id: { $ne: userId }, //Loại bỏ người dùng hiện tại đang tìm kiếm
            }

            if (role) {
                filter.role = role;
            }

            if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(query)) {
                filter.email = { $regex: query, $options: "i" };
            } 
            else if (/^\d+$/.test(query)) {
                filter.$or = [
                  { phone: { $regex: query, $options: "i" } },
                  { studentId: { $regex: query, $options: "i" } },
                ];
            } 
            else {
                filter.name = { $regex: query, $options: "i" };
            }

            const users = await User.find(filter)

            return users.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                studentId: user.studentId,
                role: user.role,
                university: user.university,
                faculty: user.faculty,
                major: user.major,
            }));

        }
        catch (error) {
            throw new Error(error.message);
        }
    }

    // async updateUser(id, data) {
    //     try {
    //         const user = await User.findOne({ _id: id, isDeleted: false });
    //         if (!user) {
    //             throw new Error("User not found");
    //         }

    //     }
    //     catch (error) {
    //         throw new Error(error.message);
    //     }
    // }


}

module.exports = new UserService();