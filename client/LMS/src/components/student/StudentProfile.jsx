import React from "react";
import { Box, Typography, Avatar, Card, CardContent, Grid } from "@mui/material";
import { CheckCircle, Description as FileText } from '@mui/icons-material';
import StatCard from './StatCard';

const StudentProfile = ({ student }) => {
  return (
    <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'stretch', lg: 'flex-start' } }}>
      {/* Profile Card - Left Side */}
      <Card sx={{ borderRadius: 2, minWidth: { lg: '350px' }, flex: { lg: '0 0 auto' } }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              src={student.avatar}
              sx={{
                width: 80,
                height: 80,
                fontSize: "2rem",
                bgcolor: "primary.main",
              }}
            >
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" mb={1}>
                Welcome back!
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {student.name}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards - Right Side */}
      <Box sx={{ flex: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
            <StatCard
              title="Enrolled Courses"
              value={student.enrolledCourses}
              icon={CheckCircle}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
            <StatCard
              title="Completed"
              value={student.completedCourses}
              icon={CheckCircle}
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
            <StatCard
              title="Certificates"
              value={student.certificatesEarned}
              icon={FileText}
              color="warning"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
            <StatCard
              title="Study Streak"
              value="1 day"
              icon={CheckCircle}
              color="info"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StudentProfile;