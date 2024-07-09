const { Router } = require('express');
const { preferencesController } = require('../controllers/preferenceController');

const preferencesRouter = Router();

preferencesRouter.get("/", preferencesController.getAllPreferences);
preferencesRouter.get("/:username", preferencesController.getUserPreference);
preferencesRouter.post("/", preferencesController.addUserPreference);

module.exports = { preferencesRouter };