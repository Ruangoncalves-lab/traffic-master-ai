import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Tenant } from '../models/index.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const register = async (req, res) => {
    const { name, email, password, tenantName } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create Tenant first
        const tenant = await Tenant.create({
            name: tenantName || `${name}'s Organization`
        });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password_hash,
            tenant_id: tenant._id,
            role: 'admin' // First user is admin
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenant_id: user.tenant_id,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[Login Attempt] Email: ${email}`);

    try {
        const user = await User.findOne({ email });
        console.log(`[Login Attempt] User found: ${user ? 'Yes' : 'No'}`);

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password_hash);
            console.log(`[Login Attempt] Password match: ${isMatch}`);

            if (isMatch) {
                user.last_login = new Date();
                await user.save();

                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    tenant_id: user.tenant_id,
                    token: generateToken(user._id),
                });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('[Login Error]', error);
        res.status(500).json({ message: error.message });
    }
};

export const getMe = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenant_id: user.tenant_id
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
