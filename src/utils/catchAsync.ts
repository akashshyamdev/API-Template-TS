import { Response, Request, NextFunction } from 'express';

export function catchAsync(fn: Function) {
	return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}
