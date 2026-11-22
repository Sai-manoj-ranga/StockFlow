
import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
function Products() {

    const navigate = useNavigate();
    const emptyForm = {
        name: "",
        sku: "",
        description: "",
        quantity: 0,
        cost_price: "",
        selling_price: "",
        low_stock_threshold: ""
    };

    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    const getConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    const fetchProducts = async () => {
        try {
            const response = await api.get("/products", getConfig());

            const data = response.data;
            setProducts(Array.isArray(data) ? data : data.products || []);

        } catch (error) {
            alert("Unable to load products.");

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const productData = {
            ...formData,
            quantity: Number(formData.quantity),
            cost_price: formData.cost_price === ""
                ? null : Number(formData.cost_price),
            selling_price: formData.selling_price === ""
                ? null : Number(formData.selling_price),
            low_stock_threshold: formData.low_stock_threshold === ""
                ? null : Number(formData.low_stock_threshold)
        };

        try {
            if (editingId) {
                await api.put(
                    `/products/${editingId}`,
                    productData,
                    getConfig()
                );

                alert("Product updated successfully!");
            } else {
                await api.post(
                    "/products",
                    productData,
                    getConfig()
                );

                alert("Product added successfully!");
            }

            setFormData(emptyForm);
            setEditingId(null);
            fetchProducts();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to save product."
            );
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.product_id);

        setFormData({
            name: product.name || "",
            sku: product.sku || "",
            description: product.description || "",
            quantity: product.quantity ?? 0,
            cost_price: product.cost_price ?? "",
            selling_price: product.selling_price ?? "",
            low_stock_threshold: product.low_stock_threshold ?? ""
        });

        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/products/${id}`, getConfig());

            alert("Product deleted successfully!");
            fetchProducts();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to delete product."
            );
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData(emptyForm);
    };

    return (
        <div className="products-page">
            <Navbar />

            <h2>StockFlow - Product Management</h2>

            <form className="product-form" onSubmit={handleSubmit}>

                <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>

                <input
                    name="name"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <input
                    name="sku"
                    placeholder="SKU"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                />

                <input
                    type="number"
                    name="cost_price"
                    placeholder="Cost Price"
                    min="0"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="selling_price"
                    placeholder="Selling Price"
                    min="0"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="low_stock_threshold"
                    placeholder="Low Stock Threshold (optional)"
                    min="0"
                    value={formData.low_stock_threshold}
                    onChange={handleChange}
                />

                <button type="submit">
                    {editingId ? "Update Product" : "Add Product"}
                </button>

                {editingId && (
                    <button type="button" onClick={cancelEdit}>
                        Cancel
                    </button>
                )}

            </form>

            <h3>Product List ({products.length})</h3>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Cost Price</th>
                        <th>Selling Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((product) => (
                        <tr key={product.product_id}>
                            <td>{product.name}</td>
                            <td>{product.sku}</td>
                            <td>{product.quantity}</td>
                            <td>{product.cost_price ?? "-"}</td>
                            <td>{product.selling_price ?? "-"}</td>

                            <td>
                                <button
                                    type="button"
                                    onClick={() => handleEdit(product)}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(product.product_id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}

                    {products.length === 0 && (
                        <tr>
                            <td colSpan="6">No products found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

        </div>
    );
}

export default Products;
