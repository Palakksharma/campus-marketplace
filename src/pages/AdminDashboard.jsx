import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import {
  School,
  People,
  Category,
  CheckCircle,
  AccountBalanceWallet,
  ArrowForward,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";

const AdminDashboard = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  
  // Registration Form State
  const [registering, setRegistering] = useState(false);
  const [collegeForm, setCollegeForm] = useState({
    collegeName: "",
    address: "",
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/auth/admin/stats");
      setStatsData(response.data);
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setCollegeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!collegeForm.collegeName || !collegeForm.address) {
      toast.error("Please fill in all fields");
      return;
    }

    setRegistering(true);
    try {
      const response = await apiClient.post("/college/admin", collegeForm);
      if (response.data) {
        toast.success("College registered successfully!");
        // Refresh AuthContext to ensure user's college reference is loaded
        await checkAuth();
        // Load stats
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register college");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Case 1: College not created yet
  if (statsData && !statsData.hasCollege) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              p: 2,
              borderRadius: "50%",
              bgcolor: "primary.light",
              color: "primary.main",
              mb: 3,
            }}
          >
            <School sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
            Setup Your College
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Before managing students and listings, please configure your college's information to open the local marketplace hub.
          </Typography>

          <Box component="form" onSubmit={handleRegisterSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="collegeName"
              label="College/University Name"
              name="collegeName"
              value={collegeForm.collegeName}
              onChange={handleRegisterChange}
              disabled={registering}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="address"
              label="Campus Address / Location"
              name="address"
              value={collegeForm.address}
              onChange={handleRegisterChange}
              disabled={registering}
              sx={{ mb: 4 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={registering}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              {registering ? <CircularProgress size={24} color="inherit" /> : "Register College"}
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Case 2: College created, show dashboard statistics
  const { stats, collegeName, collegeAddress } = statsData;

  const cards = [
    {
      title: "Total Students",
      value: stats.totalUsers,
      icon: <People sx={{ fontSize: 28 }} />,
      color: "linear-gradient(135deg, #3f51b5 0%, #1a237e 100%)",
      path: "/admin/users",
    },
    {
      title: "Unverified Students",
      value: stats.unverifiedUsers,
      icon: <CheckCircle sx={{ fontSize: 28 }} />,
      color: "linear-gradient(135deg, #e91e63 0%, #ad1457 100%)",
      path: "/admin/users",
      warning: stats.unverifiedUsers > 0,
    },
    {
      title: "Active Listings",
      value: stats.activeProducts,
      icon: <Category sx={{ fontSize: 28 }} />,
      color: "linear-gradient(135deg, #4caf50 0%, #1b5e20 100%)",
      path: "/admin/products",
    },
    {
      title: "Total Orders Logs",
      value: stats.totalOrders,
      icon: <AccountBalanceWallet sx={{ fontSize: 28 }} />,
      color: "linear-gradient(135deg, #ff9800 0%, #e65100 100%)",
      path: "/admin/orders",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)",
          color: "white",
          boxShadow: "0 10px 30px rgba(13, 71, 161, 0.15)",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {collegeName}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          📍 {collegeAddress} | Administrator Hub
        </Typography>
      </Paper>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {cards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
                border: "1px solid",
                borderColor: "divider",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                },
              }}
              onClick={() => navigate(card.path)}
            >
              {/* Top Accent Gradient Border */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "4px",
                  background: card.color,
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {card.title}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      p: 1,
                      borderRadius: 2,
                      background: card.color,
                      color: "white",
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                  {card.value}
                </Typography>
                
                {card.warning && (
                  <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                    ● Needs attention
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Links Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
          Marketplace Control Panel
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Verify Registrations
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Review pending student accounts and verify their identity before allowing marketplace trading.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                onClick={() => navigate("/admin/users")}
                sx={{ alignSelf: "flex-start", borderRadius: 2, textTransform: "none" }}
              >
                Go to Approvals
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Moderate Listings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Review active listings, inspect descriptions, prices, categories, and take down listings violating policies.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                onClick={() => navigate("/admin/products")}
                sx={{ alignSelf: "flex-start", borderRadius: 2, textTransform: "none" }}
              >
                Inspect Listings
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Transaction History
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Audit sales logs, analyze order numbers, quantity sold, and keep track of campus commerce logs.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                onClick={() => navigate("/admin/orders")}
                sx={{ alignSelf: "flex-start", borderRadius: 2, textTransform: "none" }}
              >
                View History
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
