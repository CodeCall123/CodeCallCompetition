import styled from 'styled-components';

const NotFoundText = styled.h3`
  color: white;
  font-size: 1.5rem;
  text-align: center;
  margin-top: 20px;
`;

const NoProjectFoundCard = () => {
    return (
        <NotFoundText>No projects found</NotFoundText>
    );
};

export default NoProjectFoundCard;
