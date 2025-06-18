import React from "react";
import { Box, Typography, Avatar, Paper } from "@mui/material";

const InstructorProfile = ({ instructor }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          sx={{ width: 80, height: 80 }}
          src={instructor?.avatar}
        >
          {instructor?.name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {instructor?.name || 'Instructor Name'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {instructor?.email || 'instructor@example.com'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {instructor?.department || 'Department'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default InstructorProfile;