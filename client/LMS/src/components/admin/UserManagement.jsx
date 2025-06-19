import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  CircularProgress,
  Alert,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllUsers, updateUserById, deleteUser } from "../../services/userService";

import AdminDialog from "./AdminDialog";

const UserManagement = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Use only real data from API
  const displayUsers = users || [];

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setCurrentItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          onClick={() => handleDialogOpen("createUser")}
        >
          Add New User
        </Button>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            User Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Alert severity="error">{error}</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <PersonIcon />
                        </Avatar>
                        {user.name}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={user.role === "Instructor" ? "primary" : "default"} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status} 
                        color={
                          user.status === "Active" ? "success" : 
                          user.status === "Suspended" ? "error" : "warning"
                        } 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="more"
                        aria-controls="user-menu"
                        aria-haspopup="true"
                        onClick={(e) => handleMenuClick(e, user)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDialogOpen("editUser")}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit User
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen("changeStatus")}>
          <ListItemIcon>
            {currentItem?.status === "Active" ? 
              <CancelIcon fontSize="small" color="warning" /> : 
              <CheckCircleIcon fontSize="small" color="success" />}
          </ListItemIcon>
          {currentItem?.status === "Active" ? "Suspend User" : "Activate User"}
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen("deleteUser")}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Delete User</Typography>
        </MenuItem>
      </Menu>

      <AdminDialog 
        open={openDialog} 
        onClose={handleDialogClose} 
        dialogType={dialogType} 
        currentItem={currentItem} 
      />
    </>
  );
};

export default UserManagement;
