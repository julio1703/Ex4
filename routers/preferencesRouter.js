const { Router } = require('express');
const { preferencesController } = require('../controllers/preferenceController');

const preferencesRouter = Router();

preferencesRouter.get("/", preferencesController.getAllPreferences);
preferencesRouter.get("/:username", preferencesController.getUserPreference);

module.exports = { preferencesRouter };