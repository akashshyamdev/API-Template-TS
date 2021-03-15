export default class AppError extends Error {
	public status: string;
	readonly isOperational: true;

	constructor(public message: string, public statusCode: number) {
		super(message);

		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}
