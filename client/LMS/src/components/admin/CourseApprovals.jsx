import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { getPendingCourses, approveCourse } from "../../services/courseService";

const CourseApprovals = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPendingCourses({ limit: 100 });
      setPendingCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching pending courses:', error);
      setError('Failed to load pending courses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      setActionLoading(prev => ({ ...prev, [courseId]: 'approving' }));
      await approveCourse(courseId, { is_approved: true });
      setPendingCourses(pendingCourses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Error approving course:', error);
      setError('Failed to approve course');
    } finally {
      setActionLoading(prev => ({ ...prev, [courseId]: null }));
    }
  };

  const handleReject = async (courseId) => {
    try {
      setActionLoading(prev => ({ ...prev, [courseId]: 'rejecting' }));
      await approveCourse(courseId, { is_approved: false });
      setPendingCourses(pendingCourses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Error rejecting course:', error);
      setError('Failed to reject course');
    } finally {
      setActionLoading(prev => ({ ...prev, [courseId]: null }));
    }
  };

  const oldPendingCourses = [
    {
      id: 1,
      name: "Advanced Python Programming",
      instructor: "Dr. Ahmed Khaled",
      submittedDate: "2025-06-12",
      category: "Programming",
      status: "Pending Review",
    },
    {
      id: 2,
      name: "Introduction to Quantum Computing",
      instructor: "Prof. Sarah Johnson",
      submittedDate: "2025-06-10",
      category: "Science",
      status: "Pending Review",
    },
    {
      id: 3,
      name: "Digital Marketing Fundamentals",
      instructor: "John Smith",
      submittedDate: "2025-06-08",
      category: "Business",
      status: "Pending Review",
    },
  ];

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Pending Course Approvals
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Instructor</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Alert severity="error">{error}</Alert>
                    </TableCell>
                  </TableRow>
                ) : pendingCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No pending courses found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={course.thumbnail_url}
                            alt={course.title || course.name}
                            variant="rounded"
                            sx={{ width: 60, height: 40 }}
                          >
                            {(course.title || course.name)?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{course.title || course.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {course.category_name || course.category || 'Uncategorized'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{course.instructor_name || course.instructor}</TableCell>
                      <TableCell>{course.category_name || course.category}</TableCell>
                      <TableCell>
                        {course.created_at ? new Date(course.created_at).toLocaleDateString() : course.submittedDate}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={course.status || "Pending"}
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApprove(course.id)}
                            disabled={actionLoading[course.id] === 'approving'}
                          >
                            {actionLoading[course.id] === 'approving' ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleReject(course.id)}
                            disabled={actionLoading[course.id] === 'rejecting'}
                          >
                            {actionLoading[course.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewDetails(course)}
                          >
                            View
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Course Details: {selectedCourse?.title || selectedCourse?.name}
        </DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedCourse.title || selectedCourse.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Instructor:</strong> {selectedCourse.instructor_name || selectedCourse.instructor}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Category:</strong> {selectedCourse.category_name || selectedCourse.category || 'Uncategorized'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Submitted:</strong> {selectedCourse.created_at ? new Date(selectedCourse.created_at).toLocaleDateString() : selectedCourse.submittedDate}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Description:</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedCourse.description || 'No description available'}
              </Typography>
              {selectedCourse.price && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Price:</strong> ${selectedCourse.price}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedCourse && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleApprove(selectedCourse.id);
                  setOpenDialog(false);
                }}
                disabled={actionLoading[selectedCourse.id] === 'approving'}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  handleReject(selectedCourse.id);
                  setOpenDialog(false);
                }}
                disabled={actionLoading[selectedCourse.id] === 'rejecting'}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CourseApprovals;
