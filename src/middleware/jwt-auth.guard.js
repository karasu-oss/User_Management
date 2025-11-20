import jwt from 'jsonwebtoken';
import { catchError } from '../utils/err-res.js';

export const AuthGuard = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return catchError(401, 'Authorization header missing or invalid', res);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return catchError(401, 'Token not found', res);
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = decoded;

    next();
  } catch (error) {
    return catchError(401, 'Invalid or expired token', res);
  }
};
