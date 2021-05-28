import { Root } from '../files';
import express from 'express';
const router = express.Router();

const uploaddir = '/server/uploads';

router.get('/pages/:page(*)', (req, res) => {
    let page = '/pages/' + req.params.page;
    res.sendFile(Root + uploaddir + page);
});

export { uploaddir };
export default { path: '/uploads', router };
