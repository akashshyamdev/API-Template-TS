import { Tour } from '../models/tourModel';
import { deleteOne, updateOne, createOne, getOne, getAll } from './handlerFactory';

export const getAllTours = getAll(Tour);

export const getTour = getOne(Tour, { path: 'reviews' });

export const createTour = createOne(Tour);

export const updateTour = updateOne(Tour);

export const deleteTour = deleteOne(Tour);
