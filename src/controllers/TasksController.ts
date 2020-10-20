import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import taskView from '../views/tasks_view';
import * as Yup from 'yup';

import Task from '../models/Task';

export default {

    async index(request: Request, response: Response) {
        const tasksRepository = getRepository(Task);
        const tasks = await tasksRepository.find({
            relations: ['images']
        });

        return response.json(taskView.renderMany(tasks)); 

    },

    async show(request: Request, response: Response) {
        const { id } = request.params;
        const tasksRepository = getRepository(Task);
        const task = await tasksRepository.findOneOrFail(id, {
            relations: ['images']
        });

        return response.json(taskView.render(task)); 
    },

    async create(request: Request, response: Response) {
        const {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends
        } = request.body;
    
        const tasksRepository = getRepository(Task);

        const requestImages = request.files as Express.Multer.File[];

        const images = requestImages.map(image => {
            return { path: image.filename}
        })
    
        const data = {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends: open_on_weekends === 'true',
            images
        }

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            latitude: Yup.number().required(),
            longitude: Yup.number().required(),
            about: Yup.string().required().max(300),
            instructions: Yup.string().required(),
            opening_hours: Yup.string().required(),
            open_on_weekends: Yup.boolean().required(),
            images: Yup.array(
                Yup.object().shape({
                    path: Yup.string().required()
                })
            )
        });


        await schema.validate(data, {
            abortEarly: false,
        })

        const task = tasksRepository.create(data);

        await tasksRepository.save(task);

        return response.status(201).json(task);
    
    }
};