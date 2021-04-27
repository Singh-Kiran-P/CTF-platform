import express from 'express';
const router = express.Router();


router.get('/:page*', (req, res) => {
    let file  = req.params.page + req.params[0];
    console.log(__dirname);
    res.sendFile("/ctf/server/public/"+file);
})

export default { path: '/pages', router };
