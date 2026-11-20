
const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authmiddleware");

const {
    getSettings,
    updateSettings
} = require("../controllers/settingsController");

// GET ORGANIZATION SETTINGS
router.get("/", verifyToken, getSettings);

// UPDATE ORGANIZATION SETTINGS
router.put("/", verifyToken, updateSettings);

module.exports = router;
