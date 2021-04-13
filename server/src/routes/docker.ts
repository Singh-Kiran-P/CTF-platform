import express from 'express';
const router = express.Router();

/**
 * Return info of all containers
 */
router.get("/conatiners", (req, res) => {
  return res.json();
});

export default { path: '/docker', router };
