import { Router } from 'express';
import multer from 'multer';

import uploadConfig from './config/upload';
import TasksController from './controllers/TasksController';


const routes = Router();
const upload = multer(uploadConfig);

// index, show, create, update, delete

routes.get('/tasks', TasksController.index);
routes.get('/tasks/:id', TasksController.show);
routes.post('/tasks', upload.array('images'), TasksController.create);

export default routes;