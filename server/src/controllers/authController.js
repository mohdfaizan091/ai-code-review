import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema } from "../services/authService.js";

export const register = async (req, res) => {
    try {
        const parsed = registerSchema.parse(req.body);

        const existingUser = await User.findOne({ email: parsed.email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(parsed.password, 10);

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
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: "Login successful" });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getMe = (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user
    });
};