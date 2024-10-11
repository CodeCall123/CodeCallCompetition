import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom'; 
import axios from 'axios';

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1f1c1c;
  padding: 20px;
  box-sizing: border-box;
`;

const LeaderboardWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  background-color: #2b2b2b;
  padding: 20px;
  border-radius: 10px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: #3a3a3a;
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 10px;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  user-select: none;

  &:after {
    content: '${props => props.sortDirection === "ascending" ? "↑" : props.sortDirection === "descending" ? "↓" : ""}';
    position: absolute;
    right: 10px;
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #242424;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  color: white;
  font-size: 1rem;
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
`;

const EarningsWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const EarningsLogo = styled.img`
  width: 20px;
  height: 20px;
  margin-left: 5px;
`;

const usdcLogoUrl = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #242122;
  border-radius: 8px;
  color: white;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: white;
  padding: 5px;
  width: 300px;
  ::placeholder {
    color: #888;
  }
`;
const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/leaderboard`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard data', error);
      }
    };

    fetchData();
  }, []);

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setData(sortedData);
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = data.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <LeaderboardWrapper>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </SearchBar>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell
                onClick={() => sortData('rank')}
                sortDirection={sortConfig.key === 'rank' ? sortConfig.direction : null}
              >
                Rank
              </TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell
                onClick={() => sortData('totalEarnings')}
                sortDirection={sortConfig.key === 'totalEarnings' ? sortConfig.direction : null}
              >
                Earnings
              </TableHeaderCell>
              <TableHeaderCell
                onClick={() => sortData('xp')}
                sortDirection={sortConfig.key === 'xp' ? sortConfig.direction : null}
              >
                XP
              </TableHeaderCell>
              <TableHeaderCell
                onClick={() => sortData('Features')}
                sortDirection={sortConfig.key === 'Features' ? sortConfig.direction : null}
              >
                Features
              </TableHeaderCell>
              <TableHeaderCell
                onClick={() => sortData('Bugs')}
                sortDirection={sortConfig.key === 'Bugs' ? sortConfig.direction : null}
              >
                Bugs
              </TableHeaderCell>
              <TableHeaderCell
                onClick={() => sortData('Optimisations')}
                sortDirection={sortConfig.key === 'Optimisations' ? sortConfig.direction : null}
              >
                Optimisations
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {filteredData.map((user, index) => (
              <TableRow key={user._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to={`/profile/${user.username}`} style={{ color: 'white', textDecoration: 'none' }}>
                    <ProfileImage src={user.avatar || 'https://img.freepik.com/free-psd/3d-render-avatar-character_23-2150611746.jpg'} alt="profile" />
                    </Link>
                    <Link to={`/profile/${user.username}`} style={{ color: 'white', textDecoration: 'none' }}>
                      {user.username}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <EarningsWrapper>
                    {user.totalEarnings}
                    <EarningsLogo src={usdcLogoUrl} alt="USDC logo" />
                  </EarningsWrapper>
                </TableCell>
                <TableCell>{user.xp}</TableCell>
                <TableCell>{user.Features}</TableCell>
                <TableCell>{user.Bugs}</TableCell>
                <TableCell>{user.Optimisations}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </LeaderboardWrapper>
    </PageWrapper>
  );
};

export default Leaderboard;
