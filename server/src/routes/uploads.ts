import { Root } from '../files';
import express from 'express';
import param from './param';
const router = express.Router();

const uploaddir = '/server/uploads';

router.get('/pages/:page(*)', (req, res) => {
    let page = '/pages/' + param(req, 2);
    res.sendFile(Root + uploaddir + page);
});

export { uploaddir };
export default { path: '/uploads', router };
