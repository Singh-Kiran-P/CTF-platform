import express from 'express';
const router = express.Router();

router.get('/toggle', (req, res) => {
    let session: any = req.session;
    session.darkMode = !session.darkMode;
    res.send(session.darkMode);
});

router.get('/state', (req, res) => {
    let session: any = req.session;
    res.send(session.darkMode);
});

export default { path: '/darkMode', router };
