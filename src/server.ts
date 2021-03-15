import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import app from './app';

process.on('uncaughtException', (err) => {
	console.error(err.name, err.message);
	console.log('UNHANDLED REJECTION 💣 💣 💥 💥');

	process.exit(1);
});

dotenv.config();

mongoose
	.connect(process.env.DB_URL!, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then((con) => {
		console.log(colors.yellow.bold(`Database connected ${con.connection.host}`));
	})
	.catch((err) => {
		console.error(err.message.red.underline.bold);
		process.exit(1);
	});

// Listening code
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
	console.log(colors.yellow.bold(`Server running in ${process.env.NODE_ENV} on port ${port}`));
});

process.on('unhandledRejection', (err: Error) => {
	console.error(err.name, err.message);
	console.log('UNHANDLED REJECTION 💣 💣 💥 💥');

	server.close(() => {
		process.exit(0);
	});
});
