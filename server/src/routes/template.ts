import express from 'express';
const router = express.Router();

const users = [];
var id = 1;

router.get('/', (req, res) => {
     res.json({ message: 'Welcome to template route!' });
    });

router.get('/users', (req, res) => {
     res.json(users);
});

router.get('/users/:id', (req, res) => {
    const user = users.find(val => val.id === Number(req.params.id));
     res.json(user);
});

router.post('/users', (req, res) => {
    users.push({
        name: req.body.name,
        id: ++id
    });
     res.json({ message: 'Created' });
});

router.patch('/users/:id', (req, res) => {
    const user = users.find(val => val.id === Number(req.params.id));
    user.name = req.body.name;
     res.json({ message: 'Updated' });
});

router.delete('/users/:id', (req, res) => {
    const userIndex = users.findIndex(val => val.id === Number(req.params.id));
    users.splice(userIndex, 1);
     res.json({ message: 'Deleted' });
});

export default { path: '/template', router };
