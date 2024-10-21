import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import {ClipLoader} from "react-spinners";
import {FaL} from "react-icons/fa6";

const Dashboard = () => {
  const [competitions, setCompetitions] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://your-backend-url/competitions');
        if (!response.ok) {
          throw new Error('Failed to fetch competitions');
        }
        const data = await response.json();
        setCompetitions(data);
      } catch (error) {
        console.error('Error fetching competitions:', error);
      }finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const handleAddCompetition = () => {
    navigate('/add-competition');
  };
  
  if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <ClipLoader color="#36D7B7" size={50} loading={loading} />
        </div>
    );
  }

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
