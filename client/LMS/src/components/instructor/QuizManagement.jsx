import React, { useState, useEffect } from 'react';
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
  QuestionAnswer as QuestionIcon
} from '@mui/icons-material';
import { useQuizzesByLesson, useQuizManagement } from '../../hooks/useQuizzes';
import { format } from 'date-fns';

const QuizManagement = ({ lessonId, lessonTitle }) => {
  const { quizzes, loading, error, refetch } = useQuizzesByLesson(lessonId);
  const { createNewQuiz, updateExistingQuiz, deleteExistingQuiz, loading: actionLoading } = useQuizManagement();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    time_limit: '',
    passing_score: 60,
    max_attempts: 1,
    is_active: true,
    questions: []
  });
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    options: [{ option_text: '', is_correct: false }]
  });
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleOpenDialog = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizForm({
        title: quiz.title || '',
        description: quiz.description || '',
        time_limit: quiz.time_limit || '',
        passing_score: quiz.passing_score || 60,
        max_attempts: quiz.max_attempts || 1,
        is_active: quiz.is_active !== false,
        questions: quiz.questions || []
      });
    } else {
      setEditingQuiz(null);
      setQuizForm({
        title: '',
        description: '',
        time_limit: '',
        passing_score: 60,
        max_attempts: 1,
        is_active: true,
        questions: []
      });
    }
    setOpenDialog(true);
    setActionError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuiz(null);
    setShowQuestionDialog(false);
    setEditingQuestionIndex(null);
    setActionError(null);
  };

  const handleQuizFormChange = (field, value) => {
    setQuizForm(prev => ({
      ...prev,
      [field]: value
    }));
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
    const question = quizForm.questions[index];
    setQuestionForm({
      question_text: question.question_text || '',
      question_type: question.question_type || 'multiple_choice',
      points: question.points || 1,
      options: question.options || [{ option_text: '', is_correct: false }]
    });
    setEditingQuestionIndex(index);
    setShowQuestionDialog(true);
  };

  const handleDeleteQuestion = (index) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionFormChange = (field, value) => {
    setQuestionForm(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleSaveQuestion = () => {
    if (!questionForm.question_text.trim()) {
      setActionError('Question text is required');
      return;
    }
    
    if (questionForm.options.length === 0 || !questionForm.options.some(opt => opt.option_text.trim())) {
      setActionError('At least one option with text is required');
      return;
    }
    
    if (!questionForm.options.some(opt => opt.is_correct)) {
      setActionError('At least one correct answer must be selected');
      return;
    }

    const newQuestion = {
      ...questionForm,
      options: questionForm.options.filter(opt => opt.option_text.trim())
    };

    if (editingQuestionIndex !== null) {
      setQuizForm(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => 
          i === editingQuestionIndex ? newQuestion : q
        )
      }));
    } else {
      setQuizForm(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
    }
    
    setShowQuestionDialog(false);
    setEditingQuestionIndex(null);
    setActionError(null);
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) {
      setActionError('Quiz title is required');
      return;
    }
    
    if (quizForm.questions.length === 0) {
      setActionError('At least one question is required');
      return;
    }

    try {
      const quizData = {
        ...quizForm,
        time_limit: quizForm.time_limit ? parseInt(quizForm.time_limit) : null
      };

      if (editingQuiz) {
        await updateExistingQuiz(editingQuiz.id, quizData);
      } else {
        await createNewQuiz(lessonId, quizData);
      }
      
      await refetch();
      handleCloseDialog();
    } catch (err) {
      setActionError(err.message || 'Failed to save quiz');
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Quiz Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {lessonTitle}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Quiz
          </Button>
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
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
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
                    <TableCell>
                      <Chip
                        label={quiz.is_active ? 'Active' : 'Inactive'}
                        color={quiz.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {quiz.created_at ? format(new Date(quiz.created_at), 'MMM dd, yyyy') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(quiz)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Quiz Creation/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quiz Title"
                  value={quizForm.title}
                  onChange={(e) => handleQuizFormChange('title', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={quizForm.description}
                  onChange={(e) => handleQuizFormChange('description', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time Limit (minutes)"
                  type="number"
                  value={quizForm.time_limit}
                  onChange={(e) => handleQuizFormChange('time_limit', e.target.value)}
                  helperText="Leave empty for no time limit"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Passing Score (%)"
                  type="number"
                  value={quizForm.passing_score}
                  onChange={(e) => handleQuizFormChange('passing_score', parseInt(e.target.value))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Attempts"
                  type="number"
                  value={quizForm.max_attempts}
                  onChange={(e) => handleQuizFormChange('max_attempts', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={quizForm.is_active}
                      onChange={(e) => handleQuizFormChange('is_active', e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Questions Section */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Questions ({quizForm.questions.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
              >
                Add Question
              </Button>
            </Box>

            {quizForm.questions.map((question, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                    <Typography variant="subtitle2">
                      Question {index + 1}: {question.question_text.substring(0, 50)}...
                    </Typography>
                    <Box display="flex" gap={1} onClick={(e) => e.stopPropagation()}>
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
                    <strong>Type:</strong> {question.question_type.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Points:</strong> {question.points}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Options:</strong>
                  </Typography>
                  <ul>
                    {question.options.map((option, optIndex) => (
                      <li key={optIndex}>
                        {option.option_text} {option.is_correct && <strong>(Correct)</strong>}
                      </li>
                    ))}
                  </ul>
                </AccordionDetails>
              </Accordion>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSaveQuiz} 
              variant="contained"
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={20} /> : (editingQuiz ? 'Update Quiz' : 'Create Quiz')}
            </Button>
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
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2">Answer Options</Typography>
                  <Button size="small" onClick={handleAddOption}>
                    Add Option
                  </Button>
                </Box>
                {questionForm.options.map((option, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label={`Option ${index + 1}`}
                      value={option.option_text}
                      onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={option.is_correct}
                          onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Correct"
                    />
                    {questionForm.options.length > 1 && (
                      <IconButton size="small" onClick={() => handleRemoveOption(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Grid>
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