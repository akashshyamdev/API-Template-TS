import { model, Schema, Document } from 'mongoose';

export interface IProduct extends Document {}

const tourSchema = new Schema<IProduct>(
	{
		name: String,
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
		},
		toObject: {
			virtuals: true,
		},
	}
);

export const Tour = model<IProduct>('Tour', tourSchema);
