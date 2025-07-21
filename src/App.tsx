import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import GarageView from './features/cars/GarageView';
import WinnersView from './features/winners/WinnersView';

const layoutStyle: React.CSSProperties = {
  fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
  minHeight: '100vh',
  color: '#22223b',
  width: '100vw',
  boxSizing: 'border-box',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '2rem',
  padding: '1.5rem 2vw',
  background: 'rgba(255,255,255,0.95)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  alignItems: 'center',
  borderRadius: '0 0 16px 16px',
  marginBottom: '2rem',
  flexWrap: 'wrap',
};

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#22223b',
  fontWeight: 600,
  fontSize: 20,
  letterSpacing: 1,
  padding: '0.5rem 1.2rem',
  borderRadius: 8,
  transition: 'background 0.2s, color 0.2s',
  whiteSpace: 'nowrap',
};

const activeLinkStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #a3cef1 0%, #5390d9 100%)',
  color: '#fff',
  boxShadow: '0 2px 8px rgba(83,144,217,0.08)',
};

const contentStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 900,
  minWidth: 0,
  margin: '0 auto',
  background: 'rgba(255,255,255,0.95)',
  borderRadius: 16,
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  padding: '2rem 4vw',
  boxSizing: 'border-box',
  flex: 1,
};

const responsiveWrapper: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
};

const App: React.FC = () => (
  <div style={layoutStyle}>
    <div style={responsiveWrapper}>
      <Router>
        <nav style={navStyle}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}
          >
            Garage
          </NavLink>
          <NavLink
            to="/winners"
            style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}
          >
            Winners
          </NavLink>
        </nav>
        <div style={contentStyle}>
          <Routes>
            <Route path="/" element={<GarageView />} />
            <Route path="/winners" element={<WinnersView />} />
          </Routes>
        </div>
      </Router>
    </div>
    <style>{`
      @media (max-width: 1000px) {
        .app-content { max-width: 98vw !important; padding: 1rem 2vw !important; }
      }
      @media (max-width: 700px) {
        nav { flex-direction: column !important; gap: 1rem !important; padding: 1rem 2vw !important; }
        .app-content { padding: 0.5rem 1vw !important; }
      }
    `}</style>
  </div>
);

export default App;
