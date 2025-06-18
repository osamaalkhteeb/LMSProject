
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  Quiz as QuizIcon,
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getQuizzesByLesson, getQuizResults, getQuizAttempts } from "../../services/quizService";
import { getLessonsByCourse } from "../../services/lessonService";
import { format } from "date-fns";

const QuizzesTab = ({ enrolledCourses }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizResults, setQuizResults] = useState({});

  useEffect(() => {
    fetchQuizzes();
  }, [enrolledCourses]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allQuizzes = [];
      const results = {};
      
      for (const course of enrolledCourses) {
        try {
          // First, get all lessons for this course
          const courseLessons = await getLessonsByCourse(course.id);
          
          // Then, get quizzes for each lesson
          for (const lesson of courseLessons) {
            try {
              const lessonQuizzes = await getQuizzesByLesson(lesson.id);
              const quizzesWithCourse = lessonQuizzes.map(quiz => ({
                ...quiz,
                courseName: quiz.course_title || course.title,
                courseId: course.id,
                lessonName: quiz.lesson_title || lesson.title,
                lessonId: lesson.id,
                questionCount: quiz.question_count,
                timeLimit: quiz.time_limit,
                passingScore: quiz.passing_score,
                maxAttempts: quiz.max_attempts,
              }));
              allQuizzes.push(...quizzesWithCourse);
              
              // Fetch results for each quiz
              for (const quiz of lessonQuizzes) {
                try {
                  // Use getQuizAttempts to get ALL attempts, not just the latest result
                  const allAttempts = await getQuizAttempts(quiz.id);
                  console.log(`Quiz ${quiz.id} all attempts:`, allAttempts?.map(r => ({ score: r.score, id: r.id, attempt_number: r.attempt_number })));
                  
                  if (allAttempts && allAttempts.length > 0) {
                    // Find the attempt with the highest score
                    const bestAttempt = allAttempts.reduce((best, current) => {
                      const currentScore = current.score || 0;
                      const bestScore = best.score || 0;
                      console.log(`Comparing scores: current=${currentScore}, best=${bestScore}`);
                      return (currentScore > bestScore) ? current : best;
                    });
                    console.log(`Best attempt for quiz ${quiz.id}:`, { score: bestAttempt.score, id: bestAttempt.id, attempt_number: bestAttempt.attempt_number });
                    results[quiz.id] = bestAttempt;
                  } else {
                    results[quiz.id] = null;
                  }
                } catch (err) {
                  // Quiz not taken yet or no results
                  console.warn(`Failed to fetch attempts for quiz ${quiz.id}:`, err);
                  results[quiz.id] = null;
                }
              }
            } catch (err) {
              console.warn(`Failed to fetch quizzes for lesson ${lesson.title}:`, err);
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch lessons for course ${course.title}:`, err);
        }
      }
      
      setQuizzes(allQuizzes);
      setQuizResults(results);
    } catch (err) {
      setError("Failed to load quizzes. Please try again.");
      console.error("Error fetching quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatus = (quiz) => {
    const result = quizResults[quiz.id];
    if (result) {
      return result.score !== undefined ? 'Completed' : 'In Progress';
    }
    return 'Not Started';
  };

  const getStatusColor = (quiz) => {
    const status = getQuizStatus(quiz);
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      default: return 'default';
    }
  };

  const getScoreDisplay = (quiz) => {
    const result = quizResults[quiz.id];
    if (result && result.score !== undefined) {
      const score = result.score;
      const totalScore = result.total_score || result.totalScore || 100;
      
      // Show "Failed" for 0 scores instead of "0/100"
      if (score === 0) {
        return 'Failed';
      }
      
      return `${score}/${totalScore}`;
    }
    return 'Not taken';
  };

  const handleTakeQuiz = (quizId) => {
    // Navigate to quiz taking page
    navigate(`/quiz/${quizId}`);
  };

  const handleViewResults = (quizId) => {
    // Navigate to quiz results page
    navigate(`/quiz/${quizId}/results`);
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <QuizIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            My Quizzes ({quizzes.length})
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {quizzes.length === 0 ? (
          <Box textAlign="center" py={4}>
            <QuizIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No quizzes found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have any quizzes yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quiz Title</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Questions</TableCell>
                  <TableCell>Time Limit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quizzes.map((quiz) => {
                  const status = getQuizStatus(quiz);
                  const result = quizResults[quiz.id];
                  
                  return (
                    <TableRow key={quiz.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {quiz.title}
                        </Typography>
                        {quiz.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {quiz.description.substring(0, 100)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{quiz.courseName}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {quiz.questionCount || 'N/A'} questions
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {quiz.timeLimit ? (
                          <Box display="flex" alignItems="center">
                            <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {quiz.timeLimit} min
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No limit
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status}
                          color={getStatusColor(quiz)}
                          size="small"
                          icon={status === 'Completed' ? <CompleteIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {getScoreDisplay(quiz)}
                        </Typography>
                        {result && result.score !== undefined && (
                          <Box sx={{ mt: 0.5 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={result.percentage || (result.score / (result.total_score || 100)) * 100} 
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: result.score === 0 ? '#f44336' : undefined
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              color={result.score === 0 ? 'error' : 'text.secondary'}
                            >
                              {result.score === 0 ? '0%' : (result.percentage || Math.round((result.score / (result.total_score || 100)) * 100)) + '%'}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {status === 'Completed' ? (
                            <>
                              <Tooltip title="View latest results">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<ViewIcon />}
                                  onClick={() => handleViewResults(quiz.id)}
                                >
                                  Results
                                </Button>
                              </Tooltip>
                              <Tooltip title="View all attempts">
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => navigate(`/quiz/${quiz.id}/history`)}
                                >
                                  History
                                </Button>
                              </Tooltip>
                            </>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<StartIcon />}
                              onClick={() => handleTakeQuiz(quiz.id)}
                            >
                              {status === 'In Progress' ? 'Continue' : 'Start'}
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizzesTab;