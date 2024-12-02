import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

const Notifications = ({ setNotifications }) => {
    const { username } = useContext(UserContext);
    const [competitions, setCompetitions] = useState([]);

    const fetchCompetitions = async () => {
        try {
            const response = await fetch('https://your-backend-url/competitions');//need to modify url based on your backend
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching competitions:', error);
        }
    };

    const checkCompetitionUpdates = async () => {
        const latestCompetitions = await fetchCompetitions();

        competitions.forEach((comp) => {
            const latestComp = latestCompetitions.find(c => c.id === comp.id);
            if (latestComp && latestComp.status !== comp.status) {
                setNotifications((prevNotifications) => [
                    ...prevNotifications,
                    { message: `Competition '${comp.name}' has moved to '${latestComp.status}'`, read: false }
                ]);
            }
        });

        setCompetitions(latestCompetitions);
    };

    const fetchPRs = async (repoUrl, username, accessToken) => {
        const apiUrl = `https://api.github.com/repos/${repoUrl}/pulls?state=all&creator=${username}`;
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `token ${accessToken}` //need to pass real token
                }
            });
            const prs = await response.json();
            return prs;
        } catch (error) {
            console.error('Error fetching PRs:', error);
        }
    };

    const checkPRUpdates = async (repoUrl, accessToken) => {
        const prs = await fetchPRs(repoUrl, username, accessToken);

        prs.forEach((pr) => {
            if (pr.state === 'closed' && pr.merged_at && !pr.draft) {
                setNotifications((prevNotifications) => [
                    ...prevNotifications,
                    { message: `Your PR '${pr.title}' was approved and merged`, read: false }
                ]);
            }
        });
    };

    useEffect(() => {
        const intervalId = setInterval(checkCompetitionUpdates, 60000);
        const prIntervalId = setInterval(() => checkPRUpdates("repo_url_here", "access_token_here"), 60000);

        fetchCompetitions().then((data) => setCompetitions(data));

        return () => {
            clearInterval(intervalId);
            clearInterval(prIntervalId);
        };
    }, []);

    return null; // This component only handles logic; no UI rendering.
};

export default Notifications;