const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { Product } = require('../../dist/models/productModel');
const colors = require('colors');

dotenv.config();

mongoose
	.connect(process.env.DB_URL, {
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

const tours = JSON.parse(fs.readFileSync(path.resolve(__dirname, './tours.json'), 'utf-8'));

async function importData() {
	try {
		await Product.create(tours);

		console.log(colors.green('Data successfully imported'));
	} catch (error) {
		console.error(colors.red.bold(error));
	}

	process.exit();
}

async function deleteData() {
	try {
		await Product.deleteMany();

		console.log(colors.green('Data successfully deleted!'));
	} catch (error) {
		console.error(colors.red.bold(error));
	}

	process.exit();
}

if (process.argv[2] === '--import' || process.argv[2] === '-i') {
	importData();
}

if (process.argv[2] === '--delete' || process.argv[2] === '-d') {
	deleteData();
}
