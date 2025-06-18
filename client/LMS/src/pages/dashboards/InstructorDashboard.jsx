import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from "@mui/material";
import { MoreVert as MoreIcon } from "@mui/icons-material";
import InstructorProfile from "../../components/instructor/InstructorProfile";
import StatCard from "../../components/instructor/StatsCard";
import CoursesTab from "../../components/instructor/CoursesTab";
import SubmissionsTab from "../../components/instructor/SubmissionsTab";
import AnalyticsTab from "../../components/instructor/AnalyticsTab";
import CourseMenu from "../../components/instructor/CourseMenu";
import CourseDialog from "../../components/instructor/CourseDialog";
import CourseDetailView from "../../components/instructor/CourseDetailView";
import { useAuthContext } from "../../hooks/useAuth";
import {
  Book as BookIcon,
  People as PeopleIcon,
  Star
} from "@mui/icons-material";
import { getInstructorCourses } from "../../services/courseService";

const InstructorDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [currentCourse, setCurrentCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    stats: {
      totalCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      pendingSubmissions: 0,
    },
    loading: true,
    error: null,
  });
  
  const open = Boolean(anchorEl);
  const { user } = useAuthContext();

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch instructor's courses
      const courses = await getInstructorCourses({ limit: 100 });
      
      // Calculate stats from courses data
      const activeCourses = courses.filter(course => {
        // Convert to boolean in case they come as strings
        const isPublished = course.is_published === true || course.is_published === 'true';
        const isApproved = course.is_approved === true || course.is_approved === 'true';
        return isPublished && isApproved;
      });
      
      const stats = {
        totalCourses: courses.length,
        totalStudents: courses.reduce((sum, course) => {
          // Handle both enrolled_count and enrolled_students field names
          const enrolledCount = parseInt(course.enrolled_count || course.enrolled_students || 0);
          return sum + enrolledCount;
        }, 0),
        activeCourses: activeCourses.length,
      };
      
      setDashboardData({
        courses,
        stats,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching instructor data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data',
      }));
    }
  };

  // Instructor data using real user info
  const instructor = {
    name: user?.name || "Instructor",
    email: user?.email || "instructor@example.com",
    avatar: user?.avatar_url?.trim().replace(/`/g, '') || "",
    totalCourses: 8,
    totalStudents: 245,
    activeCourses: 5,
    averageRating: 4.7,
  };

  const courses = [
    {
      id: 1,
      name: "JavaScript Fundamentals",
      students: 85,
      modules: 6,
      status: "Published",
      lastUpdated: "2025-05-15",
    },
    {
      id: 2,
      name: "Advanced React Patterns",
      students: 42,
      modules: 5,
      status: "Published",
      lastUpdated: "2025-04-28",
    },
    {
      id: 3,
      name: "Node.js Backend Mastery",
      students: 63,
      modules: 7,
      status: "Published",
      lastUpdated: "2025-06-02",
    },
    {
      id: 4,
      name: "Python for Data Science",
      students: 0,
      modules: 4,
      status: "Draft",
      lastUpdated: "2025-06-10",
    },
  ];

  const submissions = [
    {
      id: 1,
      student: "Nour Ahmad",
      course: "JavaScript Fundamentals",
      assignment: "Final Project",
      submittedDate: "2025-06-12",
      status: "Submitted",
      grade: "-",
    },
    {
      id: 2,
      student: "Mohammed Ali",
      course: "Advanced React Patterns",
      assignment: "Component Design",
      submittedDate: "2025-06-10",
      status: "Graded",
      grade: "92/100",
    },
    {
      id: 3,
      student: "Sarah Johnson",
      course: "Node.js Backend Mastery",
      assignment: "API Implementation",
      submittedDate: "2025-06-08",
      status: "Submitted",
      grade: "-",
    },
  ];

  // Calculate analytics from real data
  const analytics = {
    monthlyRevenue: [], // This would need historical data from API
    studentEnrollments: [], // This would need historical enrollment data
    coursePerformance: dashboardData.courses.map(course => ({
      name: course.title,
      students: course.enrolled_count || 0,
      revenue: (course.enrolled_count || 0) * (course.price || 0),
    })),
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleMenuClick = (event, course) => {
    setAnchorEl(event.currentTarget);
    setCurrentCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = (type, course = null) => {
    setDialogType(type);
    if (course) {
      setCurrentCourse(course);
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setViewMode('detail');
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setViewMode('list');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <InstructorProfile instructor={instructor} />

      {/* Stats Cards */}
      {dashboardData.loading ? (
        <Grid container spacing={3} mb={4}>
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : dashboardData.error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {dashboardData.error}
        </Alert>
      ) : (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Total Courses" 
              value={dashboardData.stats.totalCourses} 
              icon={BookIcon}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Total Students" 
              value={dashboardData.stats.totalStudents} 
              icon={PeopleIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Active Courses" 
              value={dashboardData.stats.activeCourses} 
              icon={BookIcon}
              color="info"
            />
          </Grid>
        </Grid>
      )}

      {/* Tabs Section */}
      <Paper sx={{ borderRadius: 2, mb: 4 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Courses" />
          <Tab label="Submissions" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {selectedTab === 0 && (
        viewMode === 'list' ? (
          <CoursesTab 
            courses={dashboardData.courses}
            loading={dashboardData.loading}
            error={dashboardData.error}
            onRefresh={fetchInstructorData}
            handleDialogOpen={handleDialogOpen}
            handleMenuClick={handleMenuClick}
            handleCourseClick={handleCourseClick}
          />
        ) : (
          <CourseDetailView 
            course={selectedCourse}
            onBack={handleBackToCourses}
          />
        )
      )}

      {selectedTab === 1 && (
        <SubmissionsTab />
      )}

      {selectedTab === 2 && (
        <AnalyticsTab analytics={analytics} />
      )}

      <CourseMenu
        anchorEl={anchorEl}
        open={open}
        handleMenuClose={handleMenuClose}
        handleDialogOpen={handleDialogOpen}
        currentCourse={currentCourse}
      />

      <CourseDialog
        openDialog={openDialog}
        handleDialogClose={handleDialogClose}
        dialogType={dialogType}
        currentCourse={currentCourse}
      />
    </Container>
  );
};

export default InstructorDashboard;