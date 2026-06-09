import User from "../models/User.js";
import bcrypt from "bcrypt";
import { registerSchema } from "../services/authService.js";

export const register = async (req, res) => {
    try {
        //  Zod validation
        const parsed = registerSchema.parse(req.body);

        //  Duplicate email check
        const existingUser = await User.findOne({ email: parsed.email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }

        //  Password hashing
        const hashedPassword = await bcrypt.hash(parsed.password, 10);

        //  Save to DB
        const user = await User.create({
            name: parsed.name,
            email: parsed.email,
            password: hashedPassword,
        });

        res.status(201).json({ message: "User registered successfully", userId: user._id });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    res.status(200).json({ message: "Login coming soon" });
};