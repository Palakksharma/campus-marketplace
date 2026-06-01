import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiClient from "../api/apiClient";

const CATEGORIES = [
  "Electronics",
  "Books",
  "Clothing",
  "Furniture",
  "Stationery",
  "Sports",
  "Other",
];

const MyListing = () => {
  const [activeTab, setActiveTab] = useState("create"); // "create" or "view"
  
  // Create Form State
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    category: "Other",
    inStock: true,
  });

  // View Listings State
  const [myListings, setMyListings] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Edit Form State
  const [editProduct, setEditProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    category: "Other",
    inStock: true,
  });
  const [editImages, setEditImages] = useState([]);
  const [editPreviews, setEditPreviews] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch listed items
  const fetchMyListings = async () => {
    setFetchLoading(true);
    try {
      const response = await apiClient.get("/products/get-myListing");
      setMyListings(response.data.data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load your listings");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchMyListings();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.warning("You can only upload up to 5 images");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.quantity ||
      !formData.category ||
      images.length === 0
    ) {
      toast.error("Please fill all required fields and upload at least one image");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("quantity", formData.quantity);
    data.append("category", formData.category);
    data.append("inStock", formData.inStock);

    images.forEach((image) => {
      data.append("image", image); // Matches route upload.array("image", 5)
    });

    try {
      const response = await apiClient.post("/products/create", data);
      if (response.data) {
        toast.success("Product listed successfully!");
        setFormData({
          title: "",
          description: "",
          price: "",
          quantity: "",
          category: "Other",
          inStock: true,
        });
        setImages([]);
        setPreviews([]);
        setActiveTab("view"); // Switch to view listings to see the result
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.message || "Failed to list product");
    } finally {
      setLoading(false);
    }
  };

  // Edit / Update functions
  const handleEditClick = (product) => {
    setEditProduct(product);
    setEditFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
      inStock: product.inStock,
    });
    setEditPreviews(product.images?.map((img) => img.url) || []);
    setEditImages([]);
  };

  const handleEditChange = (e) => {
    const { name, value, checked, type } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.warning("You can only upload up to 5 images");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setEditImages(files);
    setEditPreviews(newPreviews);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (
      !editFormData.title ||
      !editFormData.description ||
      !editFormData.price ||
      !editFormData.quantity ||
      !editFormData.category
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setUpdateLoading(true);
    const data = new FormData();
    data.append("title", editFormData.title);
    data.append("description", editFormData.description);
    data.append("price", editFormData.price);
    data.append("quantity", editFormData.quantity);
    data.append("category", editFormData.category);
    data.append("inStock", editFormData.inStock);

    if (editImages.length > 0) {
      editImages.forEach((image) => {
        data.append("image", image);
      });
    }

    try {
      const response = await apiClient.put(`/products/update/${editProduct._id}`, data);
      if (response.data) {
        toast.success("Product updated successfully!");
        setEditProduct(null);
        fetchMyListings();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleMarkAsSold = async (id) => {
    try {
      await apiClient.patch(`/products/mark-as-sold/${id}`);
      toast.success("Product marked as sold!");
      fetchMyListings();
    } catch (error) {
      console.error("Error marking product as sold:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await apiClient.delete(`/products/delete/${id}`);
        toast.success("Listing deleted successfully!");
        fetchMyListings();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error(error.response?.data?.message || "Failed to delete listing");
      }
    }
  };

  // Using MUI CSS Variables for 100% theme synchronization
  const themedStyle = {
    color: "var(--mui-palette-text-primary)",
    backgroundColor: "var(--mui-palette-background-paper)",
    borderColor: "var(--mui-palette-divider)",
  };

  const inputStyle = {
    backgroundColor: "var(--mui-palette-background-default)",
    color: "var(--mui-palette-text-primary)",
    borderColor: "var(--mui-palette-divider)",
  };

  const secondaryTextStyle = {
    color: "var(--mui-palette-text-secondary)",
  };

  return (
    <div className="w-full flex flex-col items-center justify-start p-4 md:p-8 transition-colors duration-300">
      
      {/* Tab bar navigation */}
      <div className="flex border-b w-full max-w-5xl mb-8 justify-center gap-6" style={{ borderColor: themedStyle.borderColor }}>
        <button
          onClick={() => setActiveTab("create")}
          className={`pb-4 px-8 font-black uppercase text-sm tracking-widest border-b-[3px] transition-all cursor-pointer ${
            activeTab === "create"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-500"
          }`}
        >
          List an Item
        </button>
        <button
          onClick={() => setActiveTab("view")}
          className={`pb-4 px-8 font-black uppercase text-sm tracking-widest border-b-[3px] transition-all cursor-pointer ${
            activeTab === "view"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-500"
          }`}
        >
          My Current Listings
        </button>
      </div>

      {activeTab === "create" ? (
        <div 
          className="w-full max-w-5xl rounded-2xl p-6 md:p-10 border shadow-2xl transition-all duration-300 my-4"
          style={themedStyle}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase" style={{ color: themedStyle.color }}>
              LIST YOUR PRODUCT
            </h1>
            <p className="text-lg" style={secondaryTextStyle}>
              Fill in the details below to showcase your item on the campus marketplace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-widest opacity-80" style={{ color: themedStyle.color }}>
                  Product Title <span className="text-blue-500">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Engineering Physics Vol 1"
                    className="w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-widest opacity-80" style={{ color: themedStyle.color }}>
                  Description <span className="text-blue-500">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-4 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="1"
                    placeholder="Tell us more about the item..."
                    className="w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none font-medium"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-widest opacity-80" style={{ color: themedStyle.color }}>
                  Price <span className="text-blue-500">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-blue-500">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-bold text-lg"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-widest opacity-80" style={{ color: themedStyle.color }}>
                  Available Quantity <span className="text-blue-500">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </span>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-10" style={{ borderColor: themedStyle.borderColor }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold uppercase tracking-widest opacity-80" style={{ color: themedStyle.color }}>Category Selection</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </span>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full border rounded-xl py-4 pl-12 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none font-medium cursor-pointer"
                        style={inputStyle}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} style={{ backgroundColor: themedStyle.backgroundColor, color: themedStyle.color }}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold uppercase tracking-widest opacity-80" style={{ color: themedStyle.color }}>Media Upload</label>
                    <label 
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl hover:bg-blue-500/5 transition-all cursor-pointer group"
                      style={{ backgroundColor: inputStyle.backgroundColor, borderColor: inputStyle.borderColor }}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-bold" style={{ color: themedStyle.color }}>Browse Images</p>
                      </div>
                      <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold uppercase tracking-widest opacity-80" style={{ color: themedStyle.color }}>Previews ({previews.length}/5)</label>
                  <div 
                    className="h-[224px] border rounded-2xl p-4 overflow-y-auto custom-scrollbar"
                    style={{ backgroundColor: "var(--mui-palette-background-default)", borderColor: themedStyle.borderColor }}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                      {previews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border group" style={{ borderColor: themedStyle.borderColor }}>
                          <img src={src} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {previews.length < 5 && (
                        <label className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer" style={{ borderColor: themedStyle.borderColor }}>
                          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
              <div 
                className="flex items-center justify-between p-5 border rounded-2xl shadow-inner"
                style={{ backgroundColor: inputStyle.backgroundColor, borderColor: inputStyle.borderColor }}
              >
                <span className="font-black tracking-tight text-lg uppercase" style={{ color: themedStyle.color }}>STOCK STATUS</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div 
                    className="w-14 h-8 bg-gray-300 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:border-none after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-xl"
                  ></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer h-full min-h-[72px] font-black text-xl rounded-2xl uppercase tracking-[3px] shadow-2xl active:scale-[0.97] transition-all duration-300 flex items-center justify-center relative overflow-hidden group"
                style={{ 
                  backgroundColor: "var(--mui-palette-primary-main)", 
                  color: "var(--mui-palette-primary-contrastText)" 
                }}
              >
                <span>{loading ? "LISTING..." : "LIST NOW"}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* View Current Listings Tab */
        <div 
          className="w-full max-w-5xl rounded-2xl p-6 md:p-10 border shadow-2xl transition-all duration-300 my-4"
          style={themedStyle}
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase" style={{ color: themedStyle.color }}>
              YOUR ACTIVE LISTINGS
            </h1>
            <p className="text-lg" style={secondaryTextStyle}>
              Track, edit, or mark your listed items as sold.
            </p>
          </div>

          {fetchLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold uppercase tracking-widest text-sm opacity-60">Fetching listings...</p>
            </div>
          ) : myListings.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed rounded-[2.5rem] opacity-50" style={{ borderColor: themedStyle.borderColor }}>
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-500/5 rounded-full flex items-center justify-center text-blue-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-black mb-2 uppercase">No listings found</h3>
              <p className="max-w-md mx-auto mb-8 text-sm" style={secondaryTextStyle}>You haven't listed any items for sale. Start showcasing your things to college mates!</p>
              <button 
                onClick={() => setActiveTab("create")} 
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg hover:bg-blue-700 transition-all cursor-pointer"
              >
                List a Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myListings.map((product) => (
                <div 
                  key={product._id} 
                  className="flex flex-col md:flex-row border rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl"
                  style={{ 
                    borderColor: themedStyle.borderColor, 
                    backgroundColor: "var(--mui-palette-background-default)" 
                  }}
                >
                  {/* Image */}
                  <div className="relative w-full md:w-60 h-44 flex-shrink-0 bg-gray-900/10">
                    <img 
                      src={product.images?.[0]?.url || "https://via.placeholder.com/400x300?text=No+Image"} 
                      alt={product.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: themedStyle.color }}>
                          {product.title}
                        </h3>
                        <span className="text-2xl font-black text-blue-600">₹{product.price.toLocaleString()}</span>
                      </div>
                      
                      <p className="text-xs opacity-75 line-clamp-2 mb-4" style={secondaryTextStyle}>
                        {product.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-dashed" style={{ borderColor: themedStyle.borderColor }}>
                      <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          Qty: {product.quantity}
                        </span>
                        <span>•</span>
                        <span className={`flex items-center gap-1.5 ${product.inStock ? "text-green-500" : "text-red-500"}`}>
                          <span className={`w-2 h-2 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500 animate-pulse"}`} />
                          {product.inStock ? "In Stock" : "Sold"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {product.inStock && (
                          <button
                            onClick={() => handleMarkAsSold(product._id)}
                            className="px-4 py-2 border border-green-500/30 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                          >
                            Mark As Sold
                          </button>
                        )}
                        <button
                          onClick={() => handleEditClick(product)}
                          className="px-4 py-2 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="px-4 py-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 border shadow-2xl transition-all duration-300"
            style={themedStyle}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: themedStyle.color }}>
                Edit Listing Info
              </h2>
              <button 
                onClick={() => setEditProduct(null)} 
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-85">Product Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className="w-full border rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    style={inputStyle}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-85">Category</label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    className="w-full border rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium cursor-pointer"
                    style={inputStyle}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} style={{ backgroundColor: themedStyle.backgroundColor, color: themedStyle.color }}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-85">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditChange}
                    className="w-full border rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    style={inputStyle}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-85">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editFormData.quantity}
                    onChange={handleEditChange}
                    className="w-full border rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-85">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full border rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl" style={{ borderColor: themedStyle.borderColor, backgroundColor: inputStyle.backgroundColor }}>
                <span className="font-bold text-sm uppercase tracking-wide">In Stock status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={editFormData.inStock}
                    onChange={handleEditChange}
                    className="sr-only peer"
                  />
                  <div 
                    className="w-11 h-6 bg-gray-300 dark:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border-none after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-md"
                  ></div>
                </label>
              </div>

              <div className="border-t border-dashed pt-4" style={{ borderColor: themedStyle.borderColor }}>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-85 mb-3">
                  Replace Images (Optional)
                </label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleEditImageChange} 
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-2">
                  * Note: Uploading new files will overwrite all existing images for this product.
                </p>
                
                {editPreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {editPreviews.map((src, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border" style={{ borderColor: themedStyle.borderColor }}>
                        <img src={src} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t" style={{ borderColor: themedStyle.borderColor }}>
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="px-6 py-3 border rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-gray-500/10 cursor-pointer"
                  style={{ borderColor: themedStyle.borderColor }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-500/15"
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--mui-palette-divider);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default MyListing;