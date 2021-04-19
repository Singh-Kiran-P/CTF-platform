import Router from 'express';
const router = Router();
import DB, { Team, Account, Category } from '../database';
import { isAuth, isAdmin } from '../auth/authMiddleware';

router.get('/loadInfo', (_, res) => {
});

export default { path: '/team', router };