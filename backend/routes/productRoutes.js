
const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authmiddleware");

const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

// CREATE PRODUCT
router.post("/", verifyToken, createProduct);

// GET ALL PRODUCTS
router.get("/", verifyToken, getAllProducts);

// GET PRODUCT BY ID
router.get("/:id", verifyToken, getProductById);

// UPDATE PRODUCT
router.put("/:id", verifyToken, updateProduct);
//Delete Product
router.delete("/:id", verifyToken, deleteProduct);
module.exports = router;
