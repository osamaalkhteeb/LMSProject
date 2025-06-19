import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { FiTrendingUp, FiUsers, FiBookOpen, FiDollarSign } from 'react-icons/fi';
import { useAdminAnalytics } from '../../hooks/useAnalytics';

const AnalyticsTab = () => {
  const { analytics, loading, error } = useAdminAnalytics();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No analytics data available.
      </Alert>
    );
  }

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
            title="Total Users"
            value={analytics.totalUsers}
            icon={FiUsers}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={analytics.totalCourses}
            icon={FiBookOpen}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Growth Rate"
            value={analytics.growthRate}
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