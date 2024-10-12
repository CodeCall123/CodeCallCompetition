// src/pages/AddCompetition.js

import React, { useState } from 'react';
import '../styles/AddCompetition.css';
//ignore the file for now
const AddCompetition = () => {
  const [competitionData, setCompetitionData] = useState({
    name: '',
    description: '',
    reward: '',
    languages: [],
    types: [],
    endDate: '',
    startDate: '',
    image: '',
    repositoryLink: '',
    competitionDetails: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompetitionData({ ...competitionData, [name]: value });
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setCompetitionData((prevState) => {
      const updatedArray = checked
        ? [...prevState[field], value]
        : prevState[field].filter((item) => item !== value);
      return { ...prevState, [field]: updatedArray };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Competition added successfully!');
  };

  return (
    <div className="add-competition">
      <div className="container">
        <h1 className="title">Add Competition</h1>
        <form className="competition-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Competition Name"
            value={competitionData.name}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={competitionData.description}
            onChange={handleInputChange}
            required
          ></textarea>
          <input
            type="number"
            name="reward"
            placeholder="Reward Amount"
            value={competitionData.reward}
            onChange={handleInputChange}
            required
          />
          <div className="checkbox-group">
            <label>Languages:</label>
            <label>
              <input
                type="checkbox"
                value="JavaScript"
                checked={competitionData.languages.includes('JavaScript')}
                onChange={(e) => handleCheckboxChange(e, 'languages')}
              />
              JavaScript
            </label>
            <label>
              <input
                type="checkbox"
                value="Python"
                checked={competitionData.languages.includes('Python')}
                onChange={(e) => handleCheckboxChange(e, 'languages')}
              />
              Python
            </label>
            <label>
              <input
                type="checkbox"
                value="Java"
                checked={competitionData.languages.includes('Java')}
                onChange={(e) => handleCheckboxChange(e, 'languages')}
              />
              Java
            </label>
          </div>
          <div className="checkbox-group">
            <label>Types:</label>
            <label>
              <input
                type="checkbox"
                value="Feature Development"
                checked={competitionData.types.includes('Feature Development')}
                onChange={(e) => handleCheckboxChange(e, 'types')}
              />
              Feature Development
            </label>
            <label>
              <input
                type="checkbox"
                value="Security"
                checked={competitionData.types.includes('Security')}
                onChange={(e) => handleCheckboxChange(e, 'types')}
              />
              Security
            </label>
            <label>
              <input
                type="checkbox"
                value="Optimization"
                checked={competitionData.types.includes('Optimization')}
                onChange={(e) => handleCheckboxChange(e, 'types')}
              />
              Optimization
            </label>
          </div>
          <input
            type="date"
            name="startDate"
            placeholder="Start Date"
            value={competitionData.startDate}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="endDate"
            placeholder="End Date"
            value={competitionData.endDate}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={competitionData.image}
            onChange={handleInputChange}
            required
          />
          <input
            type="url"
            name="repositoryLink"
            placeholder="Repository Link"
            value={competitionData.repositoryLink}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="competitionDetails"
            placeholder="Competition Details"
            value={competitionData.competitionDetails}
            onChange={handleInputChange}
            required
          ></textarea>
          <button type="submit" className="styled-button">
            Submit Competition
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCompetition;
