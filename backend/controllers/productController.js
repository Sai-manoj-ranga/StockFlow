
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

module.exports = { createProduct };
