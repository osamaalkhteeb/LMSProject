import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Box
} from "@mui/material";
import { Grading as GradingIcon } from "@mui/icons-material";
import { getInstructorCourses } from "../../services/courseService";
import { getAssignmentsByLesson, getAssignmentSubmissions } from "../../services/assignmentService";

const SubmissionsTab = ({ submissions: propSubmissions }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propSubmissions) {
      setSubmissions(propSubmissions);
      setLoading(false);
    } else {
      fetchSubmissions();
    }
  }, [propSubmissions]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get instructor's courses
      const courses = await getInstructorCourses({ limit: 100 }) || [];
      
      // For now, we'll show a message that submissions need to be viewed per course
      // since there's no aggregate endpoint
      setSubmissions([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Alert severity="error">
            {error}
            <Button onClick={fetchSubmissions} sx={{ ml: 2 }}>Retry</Button>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Student Submissions
        </Typography>
        
        {submissions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No submissions found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submissions will appear here when students submit assignments from your courses.
              You can also view submissions for specific assignments within each course.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Assignment</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.student_name || submission.student}</TableCell>
                    <TableCell>{submission.course_title || submission.course}</TableCell>
                    <TableCell>{submission.assignment_title || submission.assignment}</TableCell>
                    <TableCell>
                      {submission.submitted_at ? 
                        new Date(submission.submitted_at).toLocaleDateString() : 
                        submission.submittedDate
                      }
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={submission.grade ? 'Graded' : 'Submitted'} 
                        color={submission.grade ? 'success' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{submission.grade || 'Not graded'}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<GradingIcon />}
                      >
                        {submission.grade ? 'View' : 'Grade'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SubmissionsTab;