
import React from 'react';
import { 
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  MenuBook as MenuBookIcon,
  Dashboard as DashboardIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Styled components for the search bar
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Header = ({ mode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const { user, logout } = useAuth(); // Add logout here
  const isInstructor = user?.role === 'instructor';
  const isAdmin = user?.role === 'admin';

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleCoursesClick = () => {
    // Navigate to course management/catalog
    navigate('/courses');
    handleMobileMenuClose();
  };

  const handleLoginClick = () => {
    navigate('/login');
    handleMobileMenuClose();
  };

  const handleRegisterClick = () => {
    navigate('/signup');
    handleMobileMenuClose();
  };

  const handleDashboardClick = () => {
    // Navigate to user's dashboard based on role
    if (user) {
      navigate(`/dashboard/${user.role}`);
    }
    handleMobileMenuClose();
  };

  const handleProfileClick = () => {
    navigate('/MyProfile');
    handleMenuClose();
  };

  const handleSettingsClick = () => {
    navigate('/SettingsPage');
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };
  
  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={toggleDarkMode}>
        <IconButton size="large" color="inherit">
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <p>{mode === 'light' ? 'Dark' : 'Light'} Mode</p>
      </MenuItem>
      
      {/* Show Dashboard for authenticated users in mobile menu */}
      {user && (
        <MenuItem onClick={handleDashboardClick}>
          <IconButton size="large" color="inherit">
            <DashboardIcon />
          </IconButton>
          <p>Dashboard</p>
        </MenuItem>
      )}
      
      {/* Show Courses for guests and students in mobile menu */}
      {(!user || user?.role === 'student') && (
        <MenuItem onClick={handleCoursesClick}>
          <IconButton size="large" color="inherit">
            <MenuBookIcon />
          </IconButton>
          <p>Courses</p>
        </MenuItem>
      )}
      
      {/* Show Settings only for authenticated users in mobile menu */}
      {user && (
        <MenuItem onClick={handleSettingsClick}>
          <IconButton size="large" color="inherit">
            <SettingsIcon />
          </IconButton>
          <p>Settings</p>
        </MenuItem>
      )}
      
      {/* Show Login and Register for non-authenticated users in mobile menu */}
      {!user && [
        <MenuItem key="login" onClick={handleLoginClick}>
          <IconButton size="large" color="inherit">
            <AccountCircleIcon />
          </IconButton>
          <p>Login</p>
        </MenuItem>,
        <MenuItem key="register" onClick={handleRegisterClick}>
          <IconButton size="large" color="inherit">
            <AccountCircleIcon />
          </IconButton>
          <p>Register</p>
        </MenuItem>
      ]}
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box sx={{ maxWidth: '1300px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
            {/* Logo */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', mr: 2, cursor: 'pointer' }}>
              <SchoolIcon sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                EduGo
              </Typography>
            </Box>

            {/* Mobile menu button */}
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>

            {/* Search Bar */}
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
            </Search>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop Icons */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton size="large" color="inherit" onClick={toggleDarkMode} sx={{ mx: 1 }}>
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
              {/* Show Dashboard button for authenticated users */}
              {user && (
                <Tooltip title="Dashboard">
                  <IconButton size="large" color="inherit" onClick={handleDashboardClick} sx={{ mx: 1 }}>
                    <DashboardIcon />
                    <Typography variant="body2" sx={{ ml: 1, color: 'white' }}>Dashboard</Typography>
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Show Courses button for guests and students */}
              {(!user || user?.role === 'student') && (
                <Tooltip title="Courses">
                  <IconButton size="large" color="inherit" onClick={handleCoursesClick} sx={{ mx: 1 }}>
                    <MenuBookIcon />
                    <Typography variant="body2" sx={{ ml: 1, color: 'white' }}>Courses</Typography>
                  </IconButton>
                </Tooltip>
              )}

              {/* Show Settings and Account buttons only for authenticated users */}
              {user && (
                <>
                  <Tooltip title="Settings">
                    <IconButton 
                      size="large" 
                      color="inherit" 
                      onClick={handleSettingsClick}
                      sx={{ mx: 1 }}
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Account">
                    <IconButton
                      size="large"
                      edge="end"
                      aria-label="account of current user"
                      aria-controls={menuId}
                      aria-haspopup="true"
                      onClick={handleProfileMenuOpen}
                      color="inherit"
                    >
                      <AccountCircleIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {/* Show Login and Register buttons for non-authenticated users */}
              {!user && (
                <>
                  <Button 
                    color="inherit" 
                    onClick={handleLoginClick}
                    sx={{ mx: 1, textTransform: 'none' }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    onClick={handleRegisterClick}
                    sx={{ mx: 1, textTransform: 'none' }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
};

export default Header;

