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
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Check,
  Delete,
  Search,
  Person,
  VerifiedUser,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import apiClient from "../api/apiClient";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog confirmation states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(""); // "verify" or "delete"
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/auth/admin/get-users");
      // Handle the case where no users are found (backend returns 400 or empty data)
      setUsers(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load users", error);
      // Don't show toast error if it's just a 400 "No Users Found"
      if (error.response?.status !== 400) {
        toast.error("Failed to load students");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openConfirmation = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setConfirmOpen(true);
  };

  const closeConfirmation = () => {
    setSelectedUser(null);
    setActionType("");
    setConfirmOpen(false);
  };

  const handleActionConfirm = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    try {
      if (actionType === "verify") {
        await apiClient.post(`/auth/admin/verify-user/${selectedUser._id}`);
        toast.success(`Student ${selectedUser.userName} verified successfully!`);
        // Update local state
        setUsers((prev) =>
          prev.map((u) =>
            u._id === selectedUser._id ? { ...u, isVerified: true } : u
          )
        );
      } else if (actionType === "delete") {
        await apiClient.delete(`/auth/admin/delete-user/${selectedUser._id}`);
        toast.success(`Student ${selectedUser.userName} and listings removed!`);
        // Update local state
        setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setProcessing(false);
      closeConfirmation();
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    return (
      u.userName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Manage Students
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Approve registrations or moderate student profiles in your campus marketplace.
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
          placeholder="Search by student name or email..."
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
      ) : filteredUsers.length === 0 ? (
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
          <Person sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Students Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? "Try adjusting your search query." : "No students have registered in this college yet."}
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
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Joined Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{user.userName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Chip
                        icon={<VerifiedUser sx={{ fontSize: "16px !important" }} />}
                        label="Verified"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        label="Pending"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      {!user.isVerified && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<Check />}
                          onClick={() => openConfirmation(user, "verify")}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Verify
                        </Button>
                      )}
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => openConfirmation(user, "delete")}
                        sx={{ border: "1px solid", borderColor: "error.light", borderRadius: 2 }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={closeConfirmation}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {actionType === "verify" ? "Verify Student" : "Decline and Remove Student"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === "verify"
              ? `Are you sure you want to verify student "${selectedUser?.userName}"? This will allow them to login and trade.`
              : `Are you sure you want to delete "${selectedUser?.userName}" from this marketplace? All of their product listings will also be permanently deleted. This action is irreversible.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeConfirmation} disabled={processing} sx={{ textTransform: "none", borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleActionConfirm}
            variant="contained"
            color={actionType === "verify" ? "success" : "error"}
            disabled={processing}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {processing ? <CircularProgress size={20} color="inherit" /> : actionType === "verify" ? "Verify" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;
