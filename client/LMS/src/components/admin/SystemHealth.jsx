import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  LinearProgress,
  Box,
  Chip
} from "@mui/material";
import { MonitorHeart as HealthIcon, Settings as SettingsIcon } from "@mui/icons-material";
import AdminDialog from "./AdminDialog";

const SystemHealth = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const systemHealth = [
    // ... same systemHealth data as before
     {
      id: 1,
      component: "Database",
      status: "Operational",
      uptime: "99.99%",
      lastIncident: "None",
    },
    {
      id: 2,
      component: "API Server",
      status: "Operational",
      uptime: "99.95%",
      lastIncident: "2025-05-15 (10 min downtime)",
    },
    {
      id: 3,
      component: "File Storage",
      status: "Degraded Performance",
      uptime: "99.8%",
      lastIncident: "2025-06-12 (Slow response)",
    },
    {
      id: 4,
      component: "Authentication",
      status: "Operational",
      uptime: "100%",
      lastIncident: "None",
    },
  ];

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              System Components Health
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Uptime</TableCell>
                    <TableCell>Last Incident</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {systemHealth.map((component) => (
                    <TableRow key={component.id}>
                      <TableCell>{component.component}</TableCell>
                      <TableCell>
                        <Chip 
                          label={component.status} 
                          color={
                            component.status === "Operational" ? "success" : 
                            component.status === "Degraded Performance" ? "warning" : "error"
                          } 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{component.uptime}</TableCell>
                      <TableCell>{component.lastIncident}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<HealthIcon />}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              System Overview
            </Typography>
            
            <Box mb={3}>
              <Typography variant="body2" mb={1}>
                Server Load: 42%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={42}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
              
              <Typography variant="body2" mb={1}>
                Database Usage: 78%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={78}
                color="warning"
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
              
              <Typography variant="body2" mb={1}>
                Storage Usage: 65%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={65}
                color="info"
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
            </Box>
            
            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              fullWidth
              onClick={handleDialogOpen}
            >
              System Settings
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <AdminDialog 
        open={openDialog} 
        onClose={handleDialogClose} 
        dialogType="systemSettings" 
      />
    </Grid>
  );
};

export default SystemHealth;