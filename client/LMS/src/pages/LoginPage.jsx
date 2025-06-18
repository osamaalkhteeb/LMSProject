import loginImage from "../assets/login.png";
import React, { useState } from "react";
import {
  Container,
  Box,
  Grid,
  Typography,
  Divider,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
  IconButton
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login, googleLogin, loading, errors } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(formData);
      // Redirect to appropriate dashboard based on user role
      if (result && result.user) {
        const dashboardMap = {
          'student': '/dashboard/student',
          'instructor': '/dashboard/instructor',
          'admin': '/dashboard/admin'
        };
        navigate(dashboardMap[result.user.role] || '/dashboard/student');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is already handled by the useAuth hook
      console.error('Login error:', error);
    }
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  const handleBackToHome = () => {
    navigate('/');
  };
  
  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 2,
        backgroundColor: '#f8f9fa'
      }}
    >
      <Grid 
        container 
        spacing={4} 
        alignItems="center" 
        justifyContent="center"
        sx={{ 
          maxWidth: '1200px',
          width: '100%'
        }}
      >
        {/* Image Section */}
        <Grid 
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Box
            component="img"
            src={loginImage}
            alt="Login illustration"
            sx={{ 
              width: { xs: '70%', sm: '60%', md: '90%' },
              maxWidth: '500px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </Grid>
        
        {/* Form Section */}
        <Grid 
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              maxWidth: 450,
              p: { xs: 3, sm: 4 },
              mx: { xs: 2, sm: 0 },
              borderRadius: 2,
              position: 'relative'
            }}
          >
            {/* Back Button */}
            <IconButton
              onClick={handleBackToHome}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                color: 'primary.main'
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography
              variant="h4"
              component="h1"
              align="center"
              gutterBottom
              sx={{
                mb: 4,
                fontWeight: 600,
                color: 'primary.main',
                fontSize: { xs: '1.8rem', sm: '2rem' }
              }}
            >
              Welcome Back
            </Typography>

            {errors.login && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.login}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                sx={{
                  mb: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'grey.50',
                  }
                }}
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign in with Google'}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                size="medium"
                sx={{ mb: 2 }}
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                size="medium"
                sx={{ mb: 2 }}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}
              >
                <Link href="#" variant="body2" sx={{ fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 2,
                  mb: 3,
                  py: 1.5,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>

              <Typography 
                variant="body2" 
                align="center"
                sx={{ 
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  fontWeight: 500
                }}
              >
                Don't have an account?{' '}
                <Link 
                  href="/signup" 
                  color="error"
                  sx={{ 
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Register
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;