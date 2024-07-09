const { Router } = require('express');
const { userController } = require('../controllers/userController');

const userRouter = Router();

userRouter.get('/', userController.getUserAccessToken);
userRouter.post('/', userController.registerUser);

module.exports = { userRouter };