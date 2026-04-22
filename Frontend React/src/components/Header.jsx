import * as React from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Avatar, Button, Tooltip, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import "../styles.css";

function Header({ isLogged, onLogout }) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogoutAction = () => {
    handleCloseUserMenu();
    onLogout();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#f5ba13", boxShadow: "0 2px 5px #ccc" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <TextSnippetIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: "'McLaren', cursive",
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1
            }}
          >
            Notes App
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit"><MenuIcon /></IconButton>
            <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu}>
              {!isLogged && <MenuItem onClick={handleCloseNavMenu}><Typography>Sign In</Typography></MenuItem>}
            </Menu>
          </Box>

          <Typography
  variant="h6"
  sx={{
    fontFamily: "'McLaren', cursive",
    fontWeight: 700,
    color: '#fff',
    flexGrow: 1
  }}
>
  Coach AI
</Typography>

          {isLogged && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Ustawienia">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, border: "2px solid white" }}>
                  <Avatar alt="User Profile" sx={{ bgcolor: "white", color: "#f5ba13" }}>U</Avatar>
                </IconButton>
              </Tooltip>
              <Menu sx={{ mt: '45px' }} anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}>
                <MenuItem onClick={handleLogoutAction}><Typography sx={{ textAlign: 'center' }}>Logout</Typography></MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;