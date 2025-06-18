import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { FiTrendingUp, FiUsers, FiBookOpen, FiDollarSign } from 'react-icons/fi';

const AnalyticsTab = () => {
  // Mock analytics data for admin dashboard
  const analyticsData = {
    totalRevenue: '$45,230',
    totalUsers: '1,234',
    totalCourses: '89',
    growthRate: '+12.5%'
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Icon size={40} color={color} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={analyticsData.totalRevenue}
            icon={FiDollarSign}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={analyticsData.totalUsers}
            icon={FiUsers}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={analyticsData.totalCourses}
            icon={FiBookOpen}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Growth Rate"
            value={analyticsData.growthRate}
            icon={FiTrendingUp}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Analytics
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Advanced analytics features will be implemented here. This includes:
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <Typography component="li" variant="body2">
            User engagement metrics
          </Typography>
          <Typography component="li" variant="body2">
            Course completion rates
          </Typography>
          <Typography component="li" variant="body2">
            Revenue analytics
          </Typography>
          <Typography component="li" variant="body2">
            Platform usage statistics
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AnalyticsTab;