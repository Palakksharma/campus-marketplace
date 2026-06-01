import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      // Fetch product info
      const productRes = await apiClient.get(`/products/get/${id}`);
      setProduct(productRes.data.data);

      // Check if item is wishlisted (only if logged in)
      if (user) {
        try {
          const wishlistRes = await apiClient.get("/wishlist/ids");
          const wishlistedIds = wishlistRes.data.data || [];
          setIsWishlisted(wishlistedIds.includes(id));
        } catch (e) {
          console.error("Error fetching wishlist IDs:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id, user]);

  const handleMessageClick = () => {
    if (!user) {
      toast.warning("Please sign in to message the seller");
      navigate("/signin");
      return;
    }
    if (!product?.seller?._id) {
      toast.error("Seller info is not available");
      return;
    }
    if (product.seller._id === user._id) {
      toast.warning("You cannot chat with yourself");
      return;
    }
    navigate(`/chats?sellerId=${product.seller._id}&productId=${product._id}`);
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.warning("Please sign in to save items");
      navigate("/signin");
      return;
    }
    try {
      const response = await apiClient.post("/wishlist/toggle", { productId: id });
      if (response.data.isWishlisted) {
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      } else {
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      toast.error("Wishlist action failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4" style={{ color: "var(--mui-palette-text-primary)" }}>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-black uppercase tracking-widest text-sm text-blue-500 animate-pulse">Syncing listing details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Listing Not Found</h2>
        <p className="max-w-md opacity-60 mb-8">The product you are trying to view might have been deleted or is no longer available.</p>
        <button 
          onClick={() => navigate("/products")}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg hover:bg-blue-700 transition-all cursor-pointer"
        >
          Back to marketplace
        </button>
      </div>
    );
  }

  const themedStyle = {
    color: "var(--mui-palette-text-primary)",
    backgroundColor: "var(--mui-palette-background-default)",
    borderColor: "var(--mui-palette-divider)",
  };

  const cardStyle = {
    backgroundColor: "var(--mui-palette-background-paper)",
    borderColor: "var(--mui-palette-divider)",
  };

  const secondaryTextStyle = {
    color: "var(--mui-palette-text-secondary)",
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8 transition-colors duration-300" style={themedStyle}>
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-xs font-black uppercase tracking-widest text-blue-500 hover:underline cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div 
              className="relative w-full aspect-4/3 rounded-[2rem] overflow-hidden border shadow-inner bg-black/5"
              style={{ borderColor: themedStyle.borderColor }}
            >
              <img 
                src={product.images?.[activeImageIdx]?.url || "https://via.placeholder.com/600x450?text=No+Image"} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-xl">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      activeImageIdx === idx ? "border-blue-600 scale-105 shadow-md" : "border-transparent opacity-65 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Details */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              
              {/* Badges & Title */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {product.inStock && product.quantity > 0 ? (
                    <span className="text-[9px] px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full font-black uppercase tracking-widest">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-[9px] px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-black uppercase tracking-widest">
                      Sold Out
                    </span>
                  )}
                  <span className="text-[10px] font-bold opacity-45 uppercase tracking-wider">
                    Stock count: {product.quantity}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight" style={{ color: themedStyle.color }}>
                  {product.title}
                </h1>
              </div>

              {/* Price Tag */}
              <div className="flex items-baseline gap-1.5 py-4 border-y border-dashed" style={{ borderColor: themedStyle.borderColor }}>
                <span className="text-lg font-bold text-blue-500">₹</span>
                <span className="text-4xl font-black text-blue-600 tracking-tighter">
                  {product.price.toLocaleString()}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest" style={secondaryTextStyle}>Item Description</h3>
                <p className="text-sm opacity-80 leading-relaxed whitespace-pre-line">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* Seller / College Info Box */}
              <div 
                className="p-6 rounded-3xl border shadow-sm space-y-4"
                style={cardStyle}
              >
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Seller Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-45">Owner Name</span>
                    <p className="text-sm font-bold">{product.seller?.userName || "Anonymous Student"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-45">College / Campus</span>
                    <p className="text-sm font-bold truncate" title={product.college?.collegeName}>
                      📍 {product.college?.collegeName || "Campus Hub"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 pt-3 border-t border-dashed" style={{ borderColor: themedStyle.borderColor }}>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-45">Contact Email</span>
                  <p className="text-xs font-bold opacity-75 truncate">{product.seller?.email || "No email available"}</p>
                </div>
              </div>

            </div>

            {/* Actions Panel */}
            <div className="flex items-center gap-4 pt-6 border-t" style={{ borderColor: themedStyle.borderColor }}>
              
              {/* Wishlist Toggle Button */}
              <button
                onClick={toggleWishlist}
                className={`group/heart p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isWishlisted
                    ? "bg-red-50 text-red-500 border-red-100 shadow-md shadow-red-500/5"
                    : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 border-transparent"
                }`}
                style={{
                  backgroundColor: isWishlisted ? "" : "var(--mui-palette-background-paper)",
                  borderColor: isWishlisted ? "" : themedStyle.borderColor
                }}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <svg
                  className={`w-6 h-6 transition-transform duration-300 group-hover/heart:scale-110 ${isWishlisted ? "fill-current" : ""}`}
                  fill={isWishlisted ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 006.364-6.364 4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              {/* Message Seller */}
              <button
                onClick={handleMessageClick}
                disabled={product.seller?._id === user?._id}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-blue-500/10 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {product.seller?._id === user?._id ? "Your Listing" : "Message Seller"}
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
