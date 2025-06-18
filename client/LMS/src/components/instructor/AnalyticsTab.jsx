import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography
} from "@mui/material";
import { Assessment as AnalyticsIcon } from "@mui/icons-material";

const AnalyticsTab = ({ analytics }) => {
  return (
    <Grid container spacing={3}>
      {analytics.map((course) => (
        <Grid size={{ xs: 12, md: 4 }} key={course.id}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                {course.course}
              </Typography>
              
              <Box mb={3}>
                <Typography variant="body2" mb={1}>
                  Completion Rate: {course.completionRate}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={course.completionRate}
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                
                <Typography variant="body2" mb={1}>
                  Average Score: {course.avgScore}/100
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={course.avgScore}
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                
                <Typography variant="body2">
                  Active Students: {course.activeStudents}
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                fullWidth
              >
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AnalyticsTab;