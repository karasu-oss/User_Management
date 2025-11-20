import { catchError } from '../utils/err-res.js';

export const AdminGuard = (req, res, next) => {
  try {
    const user = req?.user;
    if (user?.role === 'admin') {
      next();
    }
    return catchError(401, 'Forbidden user', res);
  } catch (error) {
    return catchError(500, error.message, res);
  }
};
