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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  BarChart as ChartIcon,
  People as PeopleIcon,
  Book as CourseIcon,
  Star,
  Settings as SettingsIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import AdminDialog from "./AdminDialog";

const SystemReports = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const reports = [
 {
      id: 1,
      name: "User Activity Report",
      type: "Daily",
      generatedDate: "2025-06-15",
      downloads: 24,
    },
    {
      id: 2,
      name: "Course Popularity",
      type: "Monthly",
      generatedDate: "2025-06-01",
      downloads: 156,
    },
    {
      id: 3,
      name: "System Performance",
      type: "Weekly",
      generatedDate: "2025-06-08",
      downloads: 42,
    },  ];

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Recent Reports
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Generated Date</TableCell>
                    <TableCell>Downloads</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.name}</TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>{report.generatedDate}</TableCell>
                      <TableCell>{report.downloads}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<ChartIcon />}
                        >
                          Generate
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
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Quick Reports
            </Typography>
            <List>
              <ListItem button>
                <ListItemIcon>
                  <PeopleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="User Registration Trends" />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemIcon>
                  <CourseIcon color="secondary" />
                </ListItemIcon>
                <ListItemText primary="Course Enrollment Stats" />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemIcon>
                  <Star color="warning" />
                </ListItemIcon>
                <ListItemText primary="Course Ratings Analysis" />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemIcon>
                  <SettingsIcon color="info" />
                </ListItemIcon>
                <ListItemText primary="System Usage Metrics" />
              </ListItem>
            </List>
            <Button 
              variant="contained" 
              fullWidth 
              sx={{ mt: 2 }}
              startIcon={<AddIcon />}
              onClick={handleDialogOpen}
            >
              Create Custom Report
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <AdminDialog 
        open={openDialog} 
        onClose={handleDialogClose} 
        dialogType="customReport" 
      />
    </Grid>
  );
};

export default SystemReports;