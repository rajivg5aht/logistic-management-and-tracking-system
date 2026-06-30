"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMongoRepository = void 0;
const user_model_1 = require("../models/user.model");
class UserMongoRepository {
    async getUserById(id) {
        const found = await user_model_1.UserModel.findOne({ _id: id });
        return found;
    }
    async getUserByEmail(email) {
        const found = await user_model_1.UserModel.findOne({ email });
        return found;
    }
    async createUser(user) {
        const created = await user_model_1.UserModel.create(user);
        return created;
    }
    async getAll() {
        const found = await user_model_1.UserModel.find();
        return found;
    }
    async update(id, user) {
        const updated = await user_model_1.UserModel.findByIdAndUpdate(id, user, {
            new: true,
        });
        return updated;
    }
    async delete(id) {
        const deleted = await user_model_1.UserModel.findByIdAndDelete(id);
        return !!deleted;
    }
    async getPaginatedUsers(page, limit, search) {
        const query = {};
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        const total = await user_model_1.UserModel.countDocuments(query);
        const users = await user_model_1.UserModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        return { users, total };
    }
}
exports.UserMongoRepository = UserMongoRepository;
