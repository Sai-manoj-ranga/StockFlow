require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const verifyToken = require("./middlewares/authmiddleware");
const productRoutes = require("./routes/productRoutes");
const app = express();

app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to StockFlow API!"
    });
});

// Signup routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Verify database and start server
const PORT = process.env.PORT || 5000;
app.get("/api/auth/me", verifyToken, (req, res) => {
    res.status(200).json({
        message: "Authentication successful",
        userId: req.user.userId,
        organizationId: req.user.organizationId
    });
});
async function startServer() {
    try {
        await db.query("SELECT 1");

        console.log("MySQL Connected Successfully!");

        app.listen(PORT, () => {
            console.log(`StockFlow API running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Database Connection Failed:", error.message);
        process.exit(1);
    }
}

startServer();
