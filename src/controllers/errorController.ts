import AppError from '../utils/AppError';
import { MongoError } from 'mongodb';
import { CastError } from 'mongoose';
import { Response, Request, NextFunction } from 'express';

type ApplicationError = IError | ICastError | IMongoError;
type keyName = { [key: string]: any };
type keyPattern = { [key: string]: any };

interface IError extends Error {
	statusCode: number;
	status: string;
	isOperational: boolean;
	code?: string;
	keyName?: keyName;
	keyPattern?: keyPattern;
}

interface ICastError extends CastError {
	code?: string;
	statusCode: number;
	status: string;
	isOperational: boolean;
	keyName?: keyName;
	keyPattern?: keyPattern;
}

interface IMongoError extends MongoError {
	statusCode: number;
	status: string;
	isOperational: boolean;
	keyPattern?: object;
	errors: {
		[key: string]: {
			message: string;
			name: string;
		};
	};
	code?: string;
	keyName?: keyName;
}

function handleCastErrorDB(err: ICastError) {
	const message = `Invalid ${err.path} is ${err.value}`;
	return new AppError(message, 400);
}

function handleValidationErrorDB(err: IMongoError) {
	const errors = Object.values(err.errors).map((el) => el.message);
	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
}

function handleDuplicateFieldsDB(err: IMongoError) {
	const value = err.errmsg!.match(/(["'])(\\?.)*?\1/)![0];

	const message = `Duplicate field value: ${value}. Please use another value!`;
	return new AppError(message, 400);
}

function handleJWTError() {
	return new AppError('Invalid token, Please login again', 401);
}

function handleJWTExpiredError() {
	return new AppError('Your token has expired, Please login again', 401);
}

export default function globalErrorHandler(err: IError, req: Request, res: Response, next: NextFunction): void {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
			stack: err.stack,
			error: err,
		});
	} else if (process.env.NODE_ENV === 'production') {
		let error: ApplicationError = Object.assign(err);

		if (error.name == 'CastError') error = handleCastErrorDB(error as ICastError);
		if (error.name == 'ValidationError') error = handleValidationErrorDB((error as unknown) as IMongoError);
		if (error.code == '11000') error = handleDuplicateFieldsDB((error as unknown) as IMongoError);

		if (error.name == 'JsonWebTokenError') error = handleJWTError();
		if (error.name == 'TokenExpiredError') error = handleJWTExpiredError();

		if (error.isOperational) {
			res.status(error.statusCode).json({
				status: error.status,
				message: error.message,
			});
		} else {
			console.error('Error 💣 💣 💥 💥');
			console.error(error);

			res.status(500).json({
				status: 'error',
				message: 'An unexpected error ocurred',
			});
		}
	}
}
