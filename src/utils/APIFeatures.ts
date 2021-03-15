import { Query } from 'mongoose';
import { IProduct } from './../models/tourModel';

export default class APIFeatures {
	constructor(public query: Query<IProduct[], IProduct>, public queryString: {}) {}

	filter() {
		const queryObj = { ...this.queryString };
		const exclude = ['page', 'sort', 'limit', 'fields'];

		// @ts-ignore
		exclude.forEach((el: string) => delete (queryObj as {})[el]);

		let queryString = JSON.stringify(queryObj);
		queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

		this.query.find(JSON.parse(queryString));

		return this;
	}

	sort() {
		// @ts-ignore
		if (this.queryString.sort!) {
			// @ts-ignore
			const sortBy = (<string>this.queryString.sort!).split(',').join(' ');
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}

		return this;
	}

	limitFields() {
		// @ts-ignore
		if (this.query.fields) {
			// @ts-ignore
			const selectBy = (<string>this.query.fields).split(',').join(' ');
			this.query = this.query.select(selectBy);
		} else {
			this.query = this.query.select('-__v');
		}

		return this;
	}

	paginate() {
		// @ts-ignore
		const page = ((this.queryString.page as unknown) as number) * 1; // @ts-ignore
		const limit = ((this.queryString.limit as unknown) as number) * 1;
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}
