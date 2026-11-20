
const db = require("../config/db");

// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            description,
            quantity,
            cost_price,
            selling_price,
            low_stock_threshold
        } = req.body;

        // Validate required fields
        if (!name || !sku) {
            return res.status(400).json({
                message: "Product name and SKU are required"
            });
        }

        // Validate quantity
        const productQuantity = quantity === undefined ? 0 : Number(quantity);

        if (!Number.isInteger(productQuantity) || productQuantity < 0) {
            return res.status(400).json({
                message: "Quantity must be a non-negative integer"
            });
        }

        // Validate optional numeric fields
        const validOptionalNumber = (value) =>
            value === undefined || value === null ||
            (value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0);

        if (
            !validOptionalNumber(cost_price) ||
            !validOptionalNumber(selling_price) ||
            !validOptionalNumber(low_stock_threshold)
        ) {
            return res.status(400).json({
                message: "Prices and low-stock threshold must be non-negative numbers"
            });
        }

        if (
            low_stock_threshold !== undefined &&
            low_stock_threshold !== null &&
            !Number.isInteger(Number(low_stock_threshold))
        ) {
            return res.status(400).json({
                message: "Low-stock threshold must be a whole number"
            });
        }

        // Organization ID comes from the verified JWT token
        const organizationId = req.user.organizationId;

        const sql = `
            INSERT INTO products
            (
                organization_id,
                name,
                sku,
                description,
                quantity,
                cost_price,
                selling_price,
                low_stock_threshold
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            organizationId,
            name.trim(),
            sku.trim(),
            description || null,
            productQuantity,
            cost_price === "" || cost_price === undefined ? null : cost_price,
            selling_price === "" || selling_price === undefined ? null : selling_price,
            low_stock_threshold === "" || low_stock_threshold === undefined
                ? null
                : low_stock_threshold
        ];

        const [result] = await db.execute(sql, values);

        return res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This SKU already exists in your organization"
            });
        }

        console.error("Create Product Error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
    try {
        // Get organization ID from JWT middleware
        const organizationId = req.user.organizationId;

        const sql = `
            SELECT
                product_id,
                name,
                sku,
                description,
                quantity,
                cost_price,
                selling_price,
                low_stock_threshold,
                created_at,
                updated_at
            FROM products
            WHERE organization_id = ?
            ORDER BY product_id DESC
        `;

        const [products] = await db.execute(sql, [organizationId]);

        return res.status(200).json({
            message: "Products retrieved successfully",
            totalProducts: products.length,
            products: products
        });

    } catch (error) {
        console.error("Get Products Error:", error);

        return res.status(500).json({
            message: "Unable to retrieve products"
        });
    }
};

 // GET PRODUCT BY ID
const getProductById = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const organizationId = req.user.organizationId;

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const sql = `
            SELECT *
            FROM products
            WHERE product_id = ?
            AND organization_id = ?
        `;

        const [products] = await db.execute(sql, [
            productId,
            organizationId
        ]);

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product retrieved successfully",
            product: products[0]
        });

    } catch (error) {
        console.error("Get Product By ID Error:", error);

        return res.status(500).json({
            message: "Unable to retrieve product"
        });
    }
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const organizationId = req.user.organizationId;

        const {
            name,
            sku,
            description,
            quantity,
            cost_price,
            selling_price,
            low_stock_threshold
        } = req.body;

        // Validate product ID
        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        // Required fields
        if (!name || !name.trim() || !sku || !sku.trim()) {
            return res.status(400).json({
                message: "Product name and SKU are required"
            });
        }

        // Validate quantity
        if (
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                message: "Quantity must be a non-negative integer"
            });
        }

        // Validate optional numeric values
        const validOptionalNumber = (value) =>
            value === null ||
            (value !== undefined &&
             value !== "" &&
             Number.isFinite(Number(value)) &&
             Number(value) >= 0);

        if (
            !validOptionalNumber(cost_price) ||
            !validOptionalNumber(selling_price) ||
            !validOptionalNumber(low_stock_threshold)
        ) {
            return res.status(400).json({
                message: "Prices and threshold must be non-negative numbers or null"
            });
        }

        if (
            low_stock_threshold !== null &&
            !Number.isInteger(Number(low_stock_threshold))
        ) {
            return res.status(400).json({
                message: "Low-stock threshold must be a whole number or null"
            });
        }

        const sql = `
            UPDATE products
            SET
                name = ?,
                sku = ?,
                description = ?,
                quantity = ?,
                cost_price = ?,
                selling_price = ?,
                low_stock_threshold = ?
            WHERE product_id = ?
            AND organization_id = ?
        `;

        const values = [
            name.trim(),
            sku.trim(),
            description || null,
            quantity,
            cost_price,
            selling_price,
            low_stock_threshold,
            productId,
            organizationId
        ];

        const [result] = await db.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product updated successfully",
            productId: productId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This SKU already exists in your organization"
            });
        }

        console.error("Update Product Error:", error);

        return res.status(500).json({
            message: "Unable to update product"
        });
    }
};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const organizationId = req.user.organizationId;

        // Validate product ID
        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const sql = `
            DELETE FROM products
            WHERE product_id = ?
            AND organization_id = ?
        `;

        const [result] = await db.execute(sql, [
            productId,
            organizationId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product deleted successfully",
            productId: productId
        });

    } catch (error) {
        console.error("Delete Product Error:", error);

        return res.status(500).json({
            message: "Unable to delete product"
        });
    }
};




module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };
