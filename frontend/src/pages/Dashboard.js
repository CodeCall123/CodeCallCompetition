import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [competitions, setCompetitions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch('https://your-backend-url/competitions');
        if (!response.ok) {
          throw new Error('Failed to fetch competitions');
        }
        const data = await response.json();
        setCompetitions(data);
      } catch (error) {
        console.error('Error fetching competitions:', error);
      }
    };

    fetchCompetitions();
  }, []);

  const handleAddCompetition = () => {
    navigate('/add-competition');
  };

  const activeCompetitions = competitions.filter((comp) => comp.status.toLowerCase() === 'live');
  const upcomingCompetitions = competitions.filter((comp) => comp.status.toLowerCase() === 'upcoming');
  const endedCompetitions = competitions.filter((comp) => comp.status.toLowerCase() === 'ended');

  return (
    <div className="dashboard">
      <div className="container">
        <h1 className="title">Your Competitions</h1>
        <button className="styled-button" onClick={handleAddCompetition}>
          Add Competition
        </button>
        <div className="competitions-section">
          <h2>Active Competitions</h2>
          <ul>
            {activeCompetitions.map((comp) => (
              <li key={comp._id}>{comp.name}</li>
            ))}
          </ul>
        </div>
        <div className="competitions-section">
          <h2>Upcoming Competitions</h2>
          <ul>
            {upcomingCompetitions.map((comp) => (
              <li key={comp._id}>{comp.name}</li>
            ))}
          </ul>
        </div>
        <div className="competitions-section">
          <h2>Ended Competitions</h2>
          <ul>
            {endedCompetitions.map((comp) => (
              <li key={comp._id}>{comp.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
