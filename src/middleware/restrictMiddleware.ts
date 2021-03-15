import { NextFunction, Response, Request } from 'express';
import AppError from '../utils/AppError';

// @ts-ignore
export default (roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		// @ts-ignore
		if (!roles.includes(req.user.role)) {
			return next(new AppError('You do not have permission to perform this action', 403));
		}

		next();
	};
};
