
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="navbar">

            <h2 className="brand">StockFlow</h2>

            <div className="nav-links">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/products">Products</NavLink>
                <NavLink to="/settings">Settings</NavLink>
            </div>

            <button onClick={handleLogout}>
                Logout
            </button>

        </nav>
    );
}

export default Navbar;
