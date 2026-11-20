
const db = require("../config/db");

// GET ORGANIZATION SETTINGS
const getSettings = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const sql = `
            SELECT default_low_stock_threshold
            FROM organization_settings
            WHERE organization_id = ?
        `;

        const [settings] = await db.execute(sql, [organizationId]);

        if (settings.length === 0) {
            return res.status(404).json({
                message: "Organization settings not found"
            });
        }

        return res.status(200).json({
            message: "Settings retrieved successfully",
            settings: settings[0]
        });

    } catch (error) {
        console.error("Get Settings Error:", error);

        return res.status(500).json({
            message: "Unable to retrieve settings"
        });
    }
};


// UPDATE ORGANIZATION SETTINGS
const updateSettings = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { default_low_stock_threshold } = req.body;

        // Validate threshold
        if (
            default_low_stock_threshold === undefined ||
            !Number.isInteger(default_low_stock_threshold) ||
            default_low_stock_threshold < 0
        ) {
            return res.status(400).json({
                message: "Default low-stock threshold must be a non-negative integer"
            });
        }

        const sql = `
            UPDATE organization_settings
            SET default_low_stock_threshold = ?
            WHERE organization_id = ?
        `;

        const [result] = await db.execute(sql, [
            default_low_stock_threshold,
            organizationId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Organization settings not found"
            });
        }

        return res.status(200).json({
            message: "Organization settings updated successfully",
            default_low_stock_threshold
        });

    } catch (error) {
        console.error("Update Settings Error:", error);

        return res.status(500).json({
            message: "Unable to update settings"
        });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
