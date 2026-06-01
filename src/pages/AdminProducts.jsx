import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from "@mui/material";
import {
  Search,
  Delete,
  Category,
  AccountCircle,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import apiClient from "../api/apiClient";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Moderation Dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [processing, setProcessing] = useState(false);

  const categories = [
    "All",
    "Electronics",
    "Books",
    "Clothing",
    "Furniture",
    "Stationery",
    "Sports",
    "Other",
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/products/admin/get-all");
      setProducts(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load products", error);
      toast.error("Failed to load listings");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openDeleteConfirmation = (product) => {
    setSelectedProduct(product);
    setConfirmOpen(true);
  };

  const closeConfirmation = () => {
    setSelectedProduct(null);
    setConfirmOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setProcessing(true);
    try {
      await apiClient.delete(`/products/admin/delete/${selectedProduct._id}`);
      toast.success("Listing removed successfully by administrator!");
      // Update local state
      setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove listing");
    } finally {
      setProcessing(false);
      closeConfirmation();
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller?.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Moderate Listings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inspect active listings, review details, and delete inappropriate content.
          </Typography>
        </Box>
      </Box>

      {/* Filter Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Search by product name, description, or seller..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { xs: "100%", sm: 400 } }}
        />

        <FormControl size="small" sx={{ minWidth: 160, ml: { sm: "auto" }, width: { xs: "100%", sm: "auto" } }}>
          <InputLabel id="category-filter-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Listings Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          <Category sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Listings Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery || selectedCategory !== "All"
              ? "Try adjusting your search filters."
              : "No listings are currently available in this college."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} key={product._id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 3,
                  "&:hover": {
                    borderColor: "primary.light",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.02)",
                  },
                }}
              >
                {/* Image Section */}
                <Box
                  sx={{
                    width: { xs: "100%", sm: 160 },
                    height: 120,
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "grey.100",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={product.images?.[0]?.url || "https://via.placeholder.com/160x120?text=No+Image"}
                    alt={product.title}
                    style={{ width: "100%", height: "100%", objectCover: "cover" }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/160x120?text=No+Image";
                    }}
                  />
                </Box>

                {/* Details Section */}
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, flexWrap: "wrap" }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, truncate: true }}>
                        {product.title}
                      </Typography>
                      <Chip label={product.category} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: 10 }} />
                      {product.inStock && product.quantity > 0 ? (
                        <Chip label="Active" color="primary" size="small" sx={{ fontWeight: 600, fontSize: 9, height: 18 }} />
                      ) : (
                        <Chip label="Sold Out" color="error" size="small" sx={{ fontWeight: 600, fontSize: 9, height: 18 }} />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", mb: 2 }}>
                      {product.description}
                    </Typography>
                  </Box>

                  {/* Footer/Meta Section */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid", borderColor: "divider", pt: 1.5, flexWrap: "wrap", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AccountCircle color="disabled" sx={{ fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Seller: {product.seller?.userName || "Unknown"}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Stock: {product.quantity}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 900 }}>
                        ₹{product.price.toLocaleString()}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => openDeleteConfirmation(product)}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        Remove Listing
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={closeConfirmation}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the listing for "{selectedProduct?.title}"? This will permanently take down the product from the marketplace and notify the seller.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeConfirmation} disabled={processing} sx={{ textTransform: "none", borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={processing}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {processing ? <CircularProgress size={20} color="inherit" /> : "Delete Listing"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProducts;
