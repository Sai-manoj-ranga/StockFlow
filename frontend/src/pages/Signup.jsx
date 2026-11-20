
import { useState } from "react";
import api from "../services/api";

function Signup() {

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
            const response = await api.post("/auth/signup", formData);

            alert("Signup successful!");

            localStorage.setItem("token", response.data.token);

            console.log(response.data);

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

            </form>
        </div>
    );
}

export default Signup;
