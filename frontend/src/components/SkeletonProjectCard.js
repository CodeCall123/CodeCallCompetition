import React from 'react';
import styled, { keyframes } from 'styled-components';

// Define the skeleton-loading animation
const skeletonLoading = keyframes`
  0% {
    background-color: #444;
  }
  50% {
    background-color: #555;
  }
  100% {
    background-color: #444;
  }
`;

// Convert .skeleton-card to a styled component
const SkeletonCardWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #242122;
  padding: 15px;
  border-radius: 8px;
  color: white;
  position: relative;
  width: 100%;
  margin-bottom: 20px;
  gap: 20px;
`;

// Convert .skeleton-rectangle to a styled component
const SkeletonRectangle = styled.div`
  width: 300px;
  height: 100px;
  background-color: #444;
  border-radius: 15px;
  animation: ${skeletonLoading} 1.2s infinite ease-in-out;
`;

// Convert .skeleton-content to a styled component
const SkeletonContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

// Convert .skeleton-title to a styled component
const SkeletonTitle = styled.div`
  width: 70%;
  height: 25px;
  background-color: #464545;
  border-radius: 8px;
  margin-bottom: 15px;
  animation: ${skeletonLoading} 1.2s infinite ease-in-out;
`;

// Convert .skeleton-description to a styled component
const SkeletonDescription = styled.div`
  width: 90%;
  height: 15px;
  background-color: #555;
  border-radius: 8px;
  animation: ${skeletonLoading} 1.2s infinite ease-in-out;
`;

const SkeletonProjectCard = () => {
    return (
        <SkeletonCardWrapper>
            <SkeletonRectangle />
            <SkeletonContent>
                <SkeletonTitle />
                <SkeletonDescription />
            </SkeletonContent>
        </SkeletonCardWrapper>
        
    );
}

export default SkeletonProjectCard