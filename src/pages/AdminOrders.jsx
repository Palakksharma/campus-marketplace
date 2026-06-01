import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Search,
  Receipt,
  ArrowForward,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import apiClient from "../api/apiClient";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/orders/admin/get-all");
      setOrders(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load orders", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const term = searchQuery.toLowerCase();
    const productTitle = o.productId?.title?.toLowerCase() || "";
    const buyerName = o.buyerId?.userName?.toLowerCase() || "";
    const sellerName = o.sellerId?.userName?.toLowerCase() || "";
    return (
      productTitle.includes(term) ||
      buyerName.includes(term) ||
      sellerName.includes(term) ||
      o._id?.toLowerCase().includes(term)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Audit Transaction Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep track of trades, quantity sold, buyer-seller matching, and total transaction volumes.
          </Typography>
        </Box>
      </Box>

      {/* Filter and Search */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Search by product, buyer, seller, or Order ID..."
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
          sx={{ maxWidth: 400 }}
        />
      </Paper>

      {/* Main Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredOrders.length === 0 ? (
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
          <Receipt sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Transactions Logged
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? "Try adjusting your search query." : "No trades have occurred under your college yet."}
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.01)",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Product Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Buyer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Seller</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const itemPrice = order.productId?.price || 0;
                const totalValue = itemPrice * order.quantity;
                return (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : "N/A"}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                      {order._id.substring(0, 8)}...
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {order.productId?.title || (
                        <span style={{ color: "var(--mui-palette-text-disabled)" }}>Deleted Product</span>
                      )}
                    </TableCell>
                    <TableCell>{order.buyerId?.userName || "Deleted User"}</TableCell>
                    <TableCell>{order.sellerId?.userName || "Deleted User"}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "success.main" }}>
                      ₹{totalValue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Done"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 700, fontSize: 10 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminOrders;
