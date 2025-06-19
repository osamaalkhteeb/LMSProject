import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  QuestionAnswer as QuestionIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useQuizzesByLesson, useQuizManagement } from '../../hooks/useQuizzes';
import { format } from 'date-fns';

const QuizManagement = ({ lessonId, lessonTitle }) => {
  const { quizzes, loading, error, refetch } = useQuizzesByLesson(lessonId);
  const { createNewQuiz, updateExistingQuiz, deleteExistingQuiz, getQuizDetails, loading: actionLoading } = useQuizManagement();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    options: [{ option_text: '', is_correct: false }]
  });
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleManageQuestions = async (quiz) => {
    try {
      setActionError(null);
      // Fetch full quiz details with questions
      const fullQuizData = await getQuizDetails(quiz.id);
      setSelectedQuiz(fullQuizData);
      setOpenDialog(true);
    } catch (error) {
      setActionError('Failed to load quiz details');
      console.error('Error loading quiz details:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedQuiz(null);
    setShowQuestionDialog(false);
    setEditingQuestionIndex(null);
    setActionError(null);
  };



  const handleAddQuestion = () => {
    setQuestionForm({
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      options: [{ option_text: '', is_correct: false }]
    });
    setEditingQuestionIndex(null);
    setShowQuestionDialog(true);
  };

  const handleEditQuestion = (index) => {
    const question = selectedQuiz.questions[index];
    setQuestionForm({
      question_text: question.question_text || '',
      question_type: question.question_type || 'multiple_choice',
      points: question.points || 1,
      options: question.options || [{ option_text: '', is_correct: false }]
    });
    setEditingQuestionIndex(index);
    setShowQuestionDialog(true);
  };

  const handleDeleteQuestion = async (index) => {
    try {
      const updatedQuestions = selectedQuiz.questions.filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, orderNum: i + 1 })); // Reorder remaining questions
      
      const updatedQuiz = {
        ...selectedQuiz,
        questions: updatedQuestions
      };
      
      // Update the quiz with the new questions list (this will delete the question from backend)
      await updateExistingQuiz(selectedQuiz.id, updatedQuiz);
      
      // Update local state
      setSelectedQuiz(updatedQuiz);
      await refetch(); // Refresh the quiz list
    } catch (error) {
      setActionError('Failed to delete question');
    }
  };

  const handleMoveQuestion = async (index, direction) => {
    try {
      const questions = [...selectedQuiz.questions];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (newIndex < 0 || newIndex >= questions.length) return;
      
      // Swap questions
      [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
      
      // Update order numbers
      const updatedQuestions = questions.map((q, i) => ({ ...q, orderNum: i + 1 }));
      
      const updatedQuiz = {
        ...selectedQuiz,
        questions: updatedQuestions
      };
      
      // Update backend
      await updateExistingQuiz(selectedQuiz.id, updatedQuiz);
      
      // Update local state
      setSelectedQuiz(updatedQuiz);
      await refetch();
    } catch (error) {
      setActionError('Failed to reorder question');
    }
  };

  const handleQuestionFormChange = (field, value) => {
    setQuestionForm(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Handle question type changes
      if (field === 'question_type') {
        if (value === 'short_answer') {
          // Remove options for short answer questions
          updated.options = [];
        } else if (value === 'true_false') {
          // Set default true/false options
          updated.options = [
            { option_text: 'True', is_correct: false },
            { option_text: 'False', is_correct: false }
          ];
        } else if (value === 'multiple_choice' && prev.question_type !== 'multiple_choice') {
          // Reset to default multiple choice options if coming from another type
          updated.options = [{ option_text: '', is_correct: false }];
        }
      }
      
      return updated;
    });
  };

  const handleOptionChange = (index, field, value) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const handleAddOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false }]
    }));
  };

  const handleRemoveOption = (index) => {
    if (questionForm.options.length > 1) {
      setQuestionForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.question_text.trim()) {
      setActionError('Question text is required');
      return;
    }
    
    // Validation for questions with options (multiple choice and true/false)
    if (questionForm.question_type !== 'short_answer') {
      if (questionForm.options.length === 0 || !questionForm.options.some(opt => opt.option_text.trim())) {
        setActionError('At least one option with text is required');
        return;
      }
      
      if (!questionForm.options.some(opt => opt.is_correct)) {
        setActionError('At least one correct answer must be selected');
        return;
      }
    }

    try {
      const questionData = {
        question_text: questionForm.question_text,
        question_type: questionForm.question_type,
        points: questionForm.points,
        orderNum: editingQuestionIndex !== null ? 
          selectedQuiz.questions[editingQuestionIndex].orderNum : 
          (selectedQuiz.questions?.length || 0) + 1,
        options: questionForm.question_type === 'short_answer' ? [] : questionForm.options
          .filter(opt => opt.option_text.trim())
          .map(opt => ({
            option_text: opt.option_text,
            is_correct: opt.is_correct
          }))
      };

      let updatedQuiz;
      if (editingQuestionIndex !== null) {
        // Update existing question
        updatedQuiz = {
          ...selectedQuiz,
          questions: selectedQuiz.questions.map((q, i) => 
            i === editingQuestionIndex ? questionData : q
          )
        };
      } else {
        // Add new question
        updatedQuiz = {
          ...selectedQuiz,
          questions: [...(selectedQuiz.questions || []), questionData]
        };
      }
      
      await updateExistingQuiz(selectedQuiz.id, updatedQuiz);
      
      // Update local state immediately
      setSelectedQuiz(updatedQuiz);
      
      // Refresh the quiz list to get the latest data from backend
      await refetch();
      
      setShowQuestionDialog(false);
      setEditingQuestionIndex(null);
      setActionError(null);
    } catch (error) {
      setActionError('Failed to save question');
    }
  };



  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteExistingQuiz(quizId);
        await refetch();
      } catch (err) {
        setActionError(err.message || 'Failed to delete quiz');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box mb={3}>
          <Typography variant="h6" fontWeight="bold">
            Quiz Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lessonTitle}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {actionError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        {quizzes.length === 0 ? (
          <Box textAlign="center" py={4}>
            <QuizIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No quizzes created yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first quiz to assess student learning
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quiz Title</TableCell>
                  <TableCell>Questions</TableCell>
                  <TableCell>Time Limit</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quizzes.map((quiz) => (
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
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <QuestionIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {quiz.questions?.length || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {quiz.time_limit ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <TimerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {quiz.time_limit} min
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No limit
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleManageQuestions(quiz)}
                      >
                        Manage Questions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Question Management Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Manage Questions - {selectedQuiz?.title}
          </DialogTitle>
          <DialogContent>
            {/* Questions Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Questions ({selectedQuiz?.questions?.length || 0})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
              >
                Add Question
              </Button>
            </Box>

            {selectedQuiz?.questions?.map((question, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                    <Typography variant="subtitle2">
                      Question {index + 1}: {question.question_text?.substring(0, 50)}...
                    </Typography>
                    <Box display="flex" gap={1} onClick={(e) => e.stopPropagation()}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleMoveQuestion(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUpIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleMoveQuestion(index, 'down')}
                        disabled={index === selectedQuiz.questions.length - 1}
                      >
                        <ArrowDownIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditQuestion(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteQuestion(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" gutterBottom>
                    <strong>Type:</strong> {question.question_type?.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Points:</strong> {question.points}
                  </Typography>
                  {question.question_type !== 'short_answer' && (
                    <>
                      <Typography variant="body2" gutterBottom>
                        <strong>Options:</strong>
                      </Typography>
                      <ul>
                        {question.options?.map((option, optIndex) => (
                          <li key={optIndex}>
                            {option.option_text} {option.is_correct && <strong>(Correct)</strong>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            )) || (
              <Box textAlign="center" py={4}>
                <QuestionIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No questions added yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click "Add Question" to create your first question
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Question Dialog */}
        <Dialog open={showQuestionDialog} onClose={() => setShowQuestionDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Question Text"
                  value={questionForm.question_text}
                  onChange={(e) => handleQuestionFormChange('question_text', e.target.value)}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={questionForm.question_type}
                    onChange={(e) => handleQuestionFormChange('question_type', e.target.value)}
                    label="Question Type"
                  >
                    <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                    <MenuItem value="true_false">True/False</MenuItem>
                    <MenuItem value="short_answer">Short Answer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Points"
                  type="number"
                  value={questionForm.points}
                  onChange={(e) => handleQuestionFormChange('points', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              {questionForm.question_type !== 'short_answer' && (
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle2">Answer Options</Typography>
                    {questionForm.question_type === 'multiple_choice' && (
                      <Button size="small" onClick={handleAddOption}>
                        Add Option
                      </Button>
                    )}
                  </Box>
                  {questionForm.options.map((option, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label={`Option ${index + 1}`}
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                        disabled={questionForm.question_type === 'true_false'}
                      />
                      <FormControlLabel
                        control={
                          questionForm.question_type === 'true_false' ? (
                            <Switch
                              checked={option.is_correct}
                              onChange={(e) => {
                                // For true/false, only allow one correct answer
                                const newOptions = questionForm.options.map((opt, i) => ({
                                  ...opt,
                                  is_correct: i === index ? e.target.checked : false
                                }));
                                setQuestionForm(prev => ({ ...prev, options: newOptions }));
                              }}
                              size="small"
                            />
                          ) : (
                            <Switch
                              checked={option.is_correct}
                              onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                              size="small"
                            />
                          )
                        }
                        label="Correct"
                      />
                      {questionForm.question_type === 'multiple_choice' && questionForm.options.length > 1 && (
                        <IconButton size="small" onClick={() => handleRemoveOption(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQuestionDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveQuestion} variant="contained">
              {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QuizManagement;