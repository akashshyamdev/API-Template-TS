import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { User, IUser } from '../models/userModel';
import AppError from '../utils/AppError';
import sendEmail from '../utils/sendEmail';

function signToken(id: string) {
	return jwt.sign({ _id: id }, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
}

function createAndSendToken(user: IUser, statusCode: number, res: Response) {
	const token = signToken(user._id);

	const cookieOptions = {
		expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN!) * 24 * 60 * 60 * 1000),
		secure: false,
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		cookieOptions.secure = true;
	}

	// @ts-ignore
	user.password = undefined;

	res.cookie('jwt', token, cookieOptions);

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user: user,
		},
	});
}

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const { name, email, password, passwordConfirm } = req.body;

	const newUser = await User.create({
		name,
		email,
		password,
		passwordConfirm,
	});

	createAndSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new AppError('Please provide both email and password', 400));
	}

	const user = await User.findOne({ email }).select('+password')!;

	if (!user || !(await user!.correctPassword(password, user?.password!))) {
		return next(new AppError('Email or password is incorrect', 401));
	}

	createAndSendToken(user, 200, res);
});

// @ts-ignore
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) return next(new AppError('There is no user with this email address', 404));

	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
	const message = `Forgot your password? No problem, submit your new password along with passwordConfirm and the resetToken at this url: ${resetUrl}\n\nIf you did not forget your password. Please ignore this email`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password Reset Token. Valid for 10 minutes',
			message,
		});
	} catch (error) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;

		await user.save();

		return new AppError('There was an error sending the email, try again later', 500);
	}

	res.status(200).json({
		status: 'success',
		message: 'Token sent to email',
	});
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest().toString('hex');
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		// @ts-ignore
		passwordResetExpires: { $gt: Date.now() },
	});

	if (!user) return next(new AppError('Invalid token or has expired', 400));

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;

	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;

	await user.save();

	createAndSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const user = await User.findById(req.user._id).select('+password');

	if (!(await user?.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError('Your current password is wrong', 401));
	}

	user!.password = req.body.password;
	user!.passwordConfirm = req.body.passwordConfirm;

	await user?.save();

	createAndSendToken(user!, 200, res);
});
