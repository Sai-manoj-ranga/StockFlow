
const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authmiddleware");

const {
    createProduct
} = require("../controllers/productController");

// Protected route
router.post("/", verifyToken, createProduct);

module.exports = router;
