const { Router } = require('express');
const { preferencesController } = require('../controllers/preferenceController');

const preferencesRouter = Router();

preferencesRouter.get("/", preferencesController.getAllPreferences);
preferencesRouter.get("/vacation", preferencesController.getVacationResult);
preferencesRouter.get("/:username", preferencesController.getUserPreference);
preferencesRouter.post("/", preferencesController.addUserPreference);
preferencesRouter.put("/", preferencesController.updateUserPreference);

module.exports = { preferencesRouter };