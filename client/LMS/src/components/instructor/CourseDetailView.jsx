import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  DragIndicator as DragIcon,
  PlayCircle as PlayIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Add as AddIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getModulesByCourse, updateModule } from '../../services/moduleService';

const CourseDetailView = ({ course, onBack }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (course) {
      fetchCourseModules();
    }
  }, [course]);

  const fetchCourseModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch modules from backend API
      const moduleData = await getModulesByCourse(course.id);
      
      // Sort modules by orderNum
      const sortedModules = moduleData.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0));
      
      setModules(sortedModules);
    } catch (error) {
      console.error('Error fetching course modules:', error);
      setError(error.response?.data?.message || 'Failed to load course modules');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update orderNum for all modules
    const updatedModules = items.map((module, index) => ({
      ...module,
      orderNum: index + 1
    }));

     setModules(updatedModules);
    
    // Update module order in backend
    try {
      // Update each module's orderNum in the backend
      await Promise.all(
        updatedModules.map(module => 
          updateModule(module.id, { orderNum: module.orderNum })
        )
      );
    } catch (error) {
      console.error('Error updating module order:', error);
      // Revert to original order on error
      setModules(modules);
      setError('Failed to update module order');
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayIcon color="primary" />;
      case 'assignment':
        return <AssignmentIcon color="secondary" />;
      case 'quiz':
        return <QuizIcon color="warning" />;
      default:
        return <PlayIcon />;
    }
  };

  const getLessonDetails = (lesson) => {
    if (lesson.duration) return lesson.duration;
    if (lesson.questions) return `${lesson.questions} questions`;
    if (lesson.points) return `${lesson.points} points`;
    return '';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchCourseModules} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mb: 2 }}
        >
          Back to Courses
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {course.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={course.is_published ? 'Published' : 'Draft'}
                color={course.is_published ? "success" : "warning"}
              />
              {!course.is_approved && (
                <Chip label="Pending Approval" color="warning" />
              )}
            </Box>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* TODO: Add module functionality */}}
          >
            Add Module
          </Button>
        </Box>
        
        {course.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {course.description}
          </Typography>
        )}
      </Box>

      {/* Modules List with Drag and Drop */}
      <Typography variant="h5" gutterBottom>
        Course Modules ({modules.length})
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Drag modules to reorder them
      </Typography>

      {!loading && modules && modules.length > 0 && (
        <DragDropContext key={`dnd-${modules.length}`} onDragEnd={handleDragEnd}>
          <Droppable droppableId="modules">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {modules.map((module, index) => (
                  <Draggable key={`module-${module.id}`} draggableId={`module-${module.id}`} index={index}>
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          mb: 2,
                          p: 3,
                          backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                          transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          {...provided.dragHandleProps}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'grab',
                            color: 'text.secondary',
                            '&:active': { cursor: 'grabbing' }
                          }}
                        >
                          <DragIcon />
                        </Box>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                              Module {module.orderNum}: {module.title}
                            </Typography>
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Box>
                          
                          <List dense>
                            {module.lessons.map((lesson, lessonIndex) => (
                              <ListItem key={lesson.id} sx={{ pl: 0 }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  {getLessonIcon(lesson.type)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={lesson.title}
                                  secondary={getLessonDetails(lesson)}
                                />
                              </ListItem>
                            ))}
                          </List>
                          
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            sx={{ mt: 1 }}
                            onClick={() => {/* TODO: Add lesson functionality */}}
                          >
                            Add Lesson
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  )}
                </Draggable>
              ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Container>
  );
};

export default CourseDetailView;