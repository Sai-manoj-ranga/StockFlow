
import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Settings() {

    const navigate = useNavigate();
    const [threshold, setThreshold] = useState(10);
    const [loading, setLoading] = useState(true);

    const getConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    // Get organization settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get(
                    "/settings",
                    getConfig()
                );

                setThreshold(
                    response.data.settings.default_low_stock_threshold
                );

            } catch (error) {
                alert(
                    error.response?.data?.message ||
                    "Unable to load settings"
                );

                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [navigate]);

    // Update organization settings
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.put(
                "/settings",
                {
                    default_low_stock_threshold: Number(threshold)
                },
                getConfig()
            );

            alert(response.data.message);

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to update settings"
            );
        }
    };

    if (loading) {
        return <h3>Loading settings...</h3>;
    }

    return (
        <div className="settings-page">
            <Navbar />

            <h2>Organization Settings</h2>

            <form
                className="settings-form"
                onSubmit={handleSubmit}
            >

                <h3>Inventory Configuration</h3>

                <label>
                    Default Low Stock Threshold
                </label>

                <input
                    type="number"
                    min="0"
                    step="1"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    required
                />

                <p>
                    Products with stock quantity less than
                    or equal to this value will be marked
                    as low stock when they do not have
                    a custom threshold.
                </p>

                <button type="submit">
                    Save Settings
                </button>

            </form>

        </div>
    );
}

export default Settings;
