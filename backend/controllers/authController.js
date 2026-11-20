
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
    let connection;

    try {
        const {
            organizationName,
            email,
            password
        } = req.body;

        // 1. Validate input
        if (!organizationName || !email || !password) {
            return res.status(400).json({
                message: "Organization name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const cleanOrganizationName = organizationName.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanOrganizationName || !cleanEmail) {
            return res.status(400).json({
                message: "Please enter valid organization and email details"
            });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Start database transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 4. Create organization
        const [organizationResult] = await connection.execute(
            `INSERT INTO organizations (organization_name)
             VALUES (?)`,
            [cleanOrganizationName]
        );

        const organizationId = organizationResult.insertId;

        // 5. Create user
        const [userResult] = await connection.execute(
            `INSERT INTO users (organization_id, email, password)
             VALUES (?, ?, ?)`,
            [organizationId, cleanEmail, hashedPassword]
        );

        const userId = userResult.insertId;

        // 6. Create default organization settings
        await connection.execute(
            `INSERT INTO organization_settings
             (organization_id, default_low_stock_threshold)
             VALUES (?, ?)`,
            [organizationId, 10]
        );

        // 7. Commit transaction
        await connection.commit();

        // 8. Generate JWT token
        const token = jwt.sign(
            {
                userId: userId,
                organizationId: organizationId
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 9. Send response
        return res.status(201).json({
            message: "Registration successful",
            token: token,
            user: {
                userId: userId,
                email: cleanEmail,
                organizationId: organizationId,
                organizationName: cleanOrganizationName
            }
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        console.error("Signup Error:", error);

        return res.status(500).json({
            message: "Registration failed. Please try again."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = { signup };
