import { User } from './../models/userModel';
import jwt, { SigningKeyCallback } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { promisify } from 'util';
import { Schema } from 'mongoose';

interface IDecoded extends SigningKeyCallback {
	iat: Date;
	_id: Schema.Types.ObjectId;
}

export default catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	let token;

	// Checking if user is present
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];

	// Checking if user has logged in
	if (!token) return next(new AppError("You're not logged in. Please login to get access.", 401));

	// @ts-ignore
	const decoded: IDecoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET!);

	// Just in case user changed his/her password
	const freshUser = await User.findById(decoded._id);

	if (!freshUser) return next(new AppError('The user belonging to this token no longer exists', 401));

	// Check if user has changed password
	if (freshUser.hasPasswordChanged(decoded.iat)) {
		return next(new AppError('User recently changed password', 401));
	}

	// @ts-ignore Put the user onto the req object
	req.user = freshUser;

	next();
});
