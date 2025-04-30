import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import config from '../config';

const CustomNavbar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSelect = () => {
    setExpanded(false);
  };

  return (
    <Navbar bg="light" expand="lg" fixed="top" expanded={expanded}>
      <Container>
        <Navbar.Brand as={Link} to="/">Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(expanded ? false : true)} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" onSelect={handleSelect}>
            <Nav.Link as={Link} to="/new-expense" onClick={handleSelect}>New Expense</Nav.Link>
            <Nav.Link as={Link} to={config.forecastBaseUrl} onClick={handleSelect}>Forecasts</Nav.Link>
          </Nav>
          <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;