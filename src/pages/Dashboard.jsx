import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";
import { CircularProgress, Box } from "@mui/material";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [stats, setStats] = useState({
    listingsCount: 0,
    activeListingsCount: 0,
    wishlistCount: 0,
    ordersCount: 0,
    chatsCount: 0,
  });
  const [recentListings, setRecentListings] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      
      let listings = [];
      let wishlist = [];
      let orders = [];
      let chats = [];

      try {
        const res = await apiClient.get("/products/get-myListing");
        listings = res.data.data || [];
      } catch (e) {
        console.error("Error fetching listings:", e);
      }

      try {
        const res = await apiClient.get("/wishlist/get-all");
        wishlist = res.data.data || [];
      } catch (e) {
        console.error("Error fetching wishlist:", e);
      }

      try {
        const res = await apiClient.get("/orders/my-orders");
        orders = res.data.data || [];
      } catch (e) {
        console.error("Error fetching orders:", e);
      }

      try {
        const res = await apiClient.get("/chat/all");
        chats = res.data || [];
      } catch (e) {
        console.error("Error fetching chats:", e);
      }

      setStats({
        listingsCount: listings.length,
        activeListingsCount: listings.filter((p) => p.inStock).length,
        wishlistCount: wishlist.length,
        ordersCount: orders.length,
        chatsCount: chats.length,
      });

      setRecentListings(listings.slice(0, 3));
      setRecentOrders(orders.slice(0, 3));
    } catch (error) {
      console.error("Error setting dashboard stats:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/signin", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        fetchDashboardData();
      }
    }
  }, [user, loading, navigate]);

  if (loading || (!user && !loading) || (user && user.role === "admin")) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // MUI color palette alignment
  const themedStyle = {
    color: "var(--mui-palette-text-primary)",
    backgroundColor: "var(--mui-palette-background-default)",
    borderColor: "var(--mui-palette-divider)",
  };

  const cardStyle = {
    backgroundColor: "var(--mui-palette-background-paper)",
    borderColor: "var(--mui-palette-divider)",
  };

  const textSecondary = {
    color: "var(--mui-palette-text-secondary)",
  };

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-300" style={themedStyle}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div 
          className="rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          }}
        >
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-purple-500/20 rounded-full blur-2xl translate-y-12 pointer-events-none" />
          
          <div>
            <span className="px-4 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[2px] border border-white/10">
              Student Hub
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 uppercase">
              Hey, {user.userName}!
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-white/15">
            <span className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v2.518a1 1 0 00.657.94l3.914 1.485a1 1 0 00.658 0l3.914-1.485a1 1 0 00.657-.94V10.12l1.69-.724a1 1 0 00.525-1.3l-.004-.01a1 1 0 01-.52-1.286l.004.01a1 1 0 00-1.302-.525l-.01.004a1 1 0 01-1.286-.52l-.004-.01a1 1 0 00-1.297-.533L10 8.01 3.31 9.397z" />
              </svg>
              {user.college?.collegeName || "Campus Marketplace member"}
            </span>
            <span className="w-1.5 h-1.5 bg-white/40 rounded-full hidden sm:inline" />
            <span className="text-sm font-bold uppercase tracking-wider opacity-90 hidden sm:inline">
              Verified Student
            </span>
          </div>
        </div>

        {/* Dashboard Stats Loading */}
        {dataLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-bold uppercase tracking-widest text-xs opacity-60">Syncing dashboard...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              
              {/* Card 1: Active Listings */}
              <div 
                onClick={() => navigate("/my-listing")}
                className="group border rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                style={cardStyle}
              >
                <div className="absolute top-0 left-0 w-full h-[4px] bg-blue-500" />
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={textSecondary}>My Listings</span>
                  <span className="p-2 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-black mb-1">{stats.activeListingsCount}</div>
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">
                  {stats.listingsCount - stats.activeListingsCount} Sold Out
                </span>
              </div>

              {/* Card 2: Wishlist */}
              <div 
                onClick={() => navigate("/wishlist")}
                className="group border rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                style={cardStyle}
              >
                <div className="absolute top-0 left-0 w-full h-[4px] bg-pink-500" />
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={textSecondary}>Wishlist</span>
                  <span className="p-2 rounded-2xl bg-pink-500/10 text-pink-500 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 006.364-6.364 4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-black mb-1">{stats.wishlistCount}</div>
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Saved products</span>
              </div>

              {/* Card 3: Orders */}
              <div 
                onClick={() => navigate("/orders")}
                className="group border rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                style={cardStyle}
              >
                <div className="absolute top-0 left-0 w-full h-[4px] bg-green-500" />
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={textSecondary}>My Deals</span>
                  <span className="p-2 rounded-2xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-black mb-1">{stats.ordersCount}</div>
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Completed Deals</span>
              </div>

              {/* Card 4: Chats */}
              <div 
                onClick={() => navigate("/chats")}
                className="group border rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                style={cardStyle}
              >
                <div className="absolute top-0 left-0 w-full h-[4px] bg-orange-500" />
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={textSecondary}>Conversations</span>
                  <span className="p-2 rounded-2xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-black mb-1">{stats.chatsCount}</div>
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Active Chats</span>
              </div>

            </div>

            {/* Quick Actions Hub */}
            <div className="border rounded-[2rem] p-6 md:p-8" style={cardStyle}>
              <h2 className="text-lg font-black uppercase tracking-widest mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                <button 
                  onClick={() => navigate("/my-listing")}
                  className="flex items-center justify-between p-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  <span>List New Item</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                <button 
                  onClick={() => navigate("/products")}
                  className="flex items-center justify-between p-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-purple-500/10"
                >
                  <span>Browse Store</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                <button 
                  onClick={() => navigate("/wishlist")}
                  className="flex items-center justify-between p-5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-pink-500/10"
                >
                  <span>View Wishlist</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 006.364-6.364 4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <button 
                  onClick={() => navigate("/chats")}
                  className="flex items-center justify-between p-5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-orange-500/10"
                >
                  <span>Chat Inbox</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>

              </div>
            </div>

            {/* Split layout for lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Recent Listings */}
              <div className="border rounded-[2rem] p-6 md:p-8" style={cardStyle}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black uppercase tracking-widest">My Recent Listings</h2>
                  <button 
                    onClick={() => navigate("/my-listing")}
                    className="text-xs font-black uppercase tracking-wider text-blue-500 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {recentListings.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-2xl opacity-40">
                    <p className="text-xs font-black uppercase tracking-widest mb-3">No items listed yet</p>
                    <button 
                      onClick={() => navigate("/my-listing")}
                      className="px-4 py-2 bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                    >
                      Create Listing
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentListings.map((product) => (
                      <div 
                        key={product._id} 
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-transparent hover:border-gray-500/10"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-500/10 flex-shrink-0">
                          <img 
                            src={product.images?.[0]?.url || "https://via.placeholder.com/150?text=No+Image"} 
                            alt={product.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-black uppercase tracking-tight truncate">
                              {product.title}
                            </h4>
                            <span className="text-sm font-black text-blue-500 flex-shrink-0">₹{product.price}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-full">
                              {product.category}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${product.inStock ? "text-green-500" : "text-red-500"}`}>
                              {product.inStock ? "Active" : "Sold"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Recent Transactions */}
              <div className="border rounded-[2rem] p-6 md:p-8" style={cardStyle}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black uppercase tracking-widest">Recent Activity</h2>
                  <button 
                    onClick={() => navigate("/orders")}
                    className="text-xs font-black uppercase tracking-wider text-blue-500 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-2xl opacity-40">
                    <p className="text-xs font-black uppercase tracking-widest mb-3">No activity recorded</p>
                    <button 
                      onClick={() => navigate("/products")}
                      className="px-4 py-2 bg-purple-600/10 text-purple-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                    >
                      Browse Store
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => {
                      const isBuyer = order.buyerId?._id === user?._id;
                      const otherParty = isBuyer ? order.sellerId : order.buyerId;
                      
                      return (
                        <div 
                          key={order._id} 
                          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-transparent hover:border-gray-500/10"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isBuyer ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
                          }`}>
                            {isBuyer ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-black uppercase tracking-tight truncate">
                                {order.productId?.title || "Unknown Item"}
                              </h4>
                              <span className="text-sm font-black text-green-500 flex-shrink-0">
                                ₹{((order.productId?.price || 0) * order.quantity).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[9px] font-bold opacity-45 uppercase">
                                {isBuyer ? `From ${otherParty?.userName}` : `To ${otherParty?.userName}`}
                              </span>
                              <span className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
