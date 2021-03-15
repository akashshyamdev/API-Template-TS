import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import APIFeatures from '../utils/APIFeatures';
import AppError from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

interface PopulateOptions {
	path: any;
	select?: any;
	model?: string | Model<any> | undefined;
	match?: any;
}

export const getAll = (Model: Model<any>, populateOptions?: PopulateOptions) =>
	catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		let filter = {};
		if (req.params.tourId) filter = { tour: req.params.tourId };

		const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
		const tours = await features.query;

		res.status(200).json({
			status: 'success',
			results: tours.length,
			data: {
				tours,
			},
		});
	});

export const getOne = (Model: Model<any>, populateOptions?: PopulateOptions, isUser?: Boolean) =>
	catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		let id = req.params.id;

		console.log(req.user?._id);

		if (isUser) id = req.user._id;

		console.log(id);

		const query = Model.findById(id);

		if (populateOptions) query.populate(populateOptions);

		const doc = await query;

		if (!doc) {
			return next(new AppError('No doc found with that ID', 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				doc,
			},
		});
	});

export const createOne = (Model: Model<any>) =>
	catchAsync(async (req: Request, res: Response) => {
		const newDoc = await Model.create(req.body);

		res.status(201).json({
			status: 'success',
			data: {
				doc: newDoc,
			},
		});
	});

export const updateOne = (Model: Model<any>) =>
	catchAsync(async (req: Request, res: Response) => {
		const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });

		res.status(200).json({
			status: 'success',
			data: {
				doc: updatedDoc,
			},
		});
	});

export const deleteOne = (Model: Model<any>) =>
	catchAsync(async function (req: Request, res: Response, next: NextFunction) {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(204).json({
			status: 'success',
			data: null,
		});
	});
