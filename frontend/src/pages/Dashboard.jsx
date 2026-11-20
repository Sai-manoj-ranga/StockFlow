
import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {

    const [dashboard, setDashboard] = useState({
        totalProducts: 0,
        totalQuantity: 0,
        lowStockCount: 0,
        lowStockProducts: []
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await api.get("/products/dashboard", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setDashboard(response.data);

            } catch (error) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        fetchDashboard();
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="dashboard">

            <header>
                <h2>StockFlow Dashboard</h2>
                <button onClick={logout}>Logout</button>
            </header>

            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <h3>Total Products</h3>
                    <h1>{dashboard.totalProducts}</h1>
                </div>

                <div className="dashboard-card">
                    <h3>Total Stock Quantity</h3>
                    <h1>{dashboard.totalQuantity}</h1>
                </div>

                <div className="dashboard-card">
                    <h3>Low Stock Products</h3>
                    <h1>{dashboard.lowStockCount}</h1>
                </div>

            </div>

            <h3>Low Stock Products</h3>

            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Threshold</th>
                    </tr>
                </thead>

                <tbody>
                    {dashboard.lowStockProducts.map((product) => (
                        <tr key={product.product_id}>
                            <td>{product.name}</td>
                            <td>{product.sku}</td>
                            <td>{product.quantity}</td>
                            <td>{product.effective_threshold}</td>
                        </tr>
                    ))}

                    {dashboard.lowStockProducts.length === 0 && (
                        <tr>
                            <td colSpan="4">No low-stock products</td>
                        </tr>
                    )}
                </tbody>
            </table>

        </div>
    );
}

export default Dashboard;
