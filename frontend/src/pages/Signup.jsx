
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        organizationName: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            await api.post("/auth/signup", formData);

            alert("Account created successfully! Please login.");

            localStorage.removeItem("token");

            navigate("/login");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Signup failed. Please try again."
            );
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSignup} className="auth-form">

                <h2>StockFlow</h2>
                <h3>Create Your Organization</h3>

                <input
                    type="text"
                    name="organizationName"
                    placeholder="Organization Name"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                />

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
                    placeholder="Password (minimum 8 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="8"
                    required
                />

                <button type="submit">Create Account</button>

                <p className="login-link">
                    Already registered?{" "}
                    <Link to="/login">Login here</Link>
                </p>

            </form>
        </div>
    );
}

export default Signup;
