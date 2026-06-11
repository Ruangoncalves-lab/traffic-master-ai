import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('[Auth Middleware] Token received:', token.substring(0, 10) + '...');

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            console.log('[Auth Middleware] Decoded ID:', decoded.id);

            req.user = await User.findById(decoded.id).select('-password_hash');

            if (!req.user) {
                console.error('[Auth Middleware] User not found for ID:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            console.log('[Auth Middleware] User found:', req.user.email, 'Tenant:', req.user.tenant_id);
            next();
        } catch (error) {
            console.error('[Auth Middleware] Error:', error.message);
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Not authorized, token failed' });
            } else {
                res.status(500).json({ message: 'Server Error during auth check' });
            }
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
