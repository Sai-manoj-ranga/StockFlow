
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/auth/login", formData);

            localStorage.setItem("token", response.data.token);

            alert("Login successful!");

            navigate("/dashboard");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleLogin} className="auth-form">

                <h2>StockFlow</h2>
                <h3>Welcome Back!</h3>

                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit">Login</button>

                <p className="signup-link">
                    Don't have an account?{" "}
                    <Link to="/">Create Account</Link>
                </p>

            </form>
        </div>
    );
}

export default Login;
