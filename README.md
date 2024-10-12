
# CodeCall Dashboard

This is a React-based application designed to manage and display competitions and code reviews, integrating GitHub for submissions and repository browsing.

## Features

- **Competitions Listing**: Browse all available competitions, filter by programming languages, types, and statuses.
- **Competition Details**: View in-depth information about each competition, including prize distribution and countdowns.
- **GitHub Integration**: Log in with GitHub, browse repositories, and submit pull requests.
- **Dynamic Countdown**: Shows live countdowns for competition phases, including submission and judging periods.
- **Pull Request Viewer**: View pull request diffs for submitted code directly within the app.

## Project Structure

The project is structured as follows:

```
├── public/                   # Public assets and files
├── src/                      # Main source folder
│   ├── assets/               # Images, icons, and other static assets
│   │   └── images/           # Specific images for the application
│   ├── components/           # Reusable React components
│   │   ├── CompetitionDetails.js   # Page component for competition details
│   │   ├── Home.js           # Main dashboard for viewing competitions
│   ├── contexts/             # Context providers for global state management
│   │   └── UserContext.js    # User authentication and session management
│   ├── styles/               # CSS and styling files
│   │   ├── CompetitionDetails.css  # Styles for the CompetitionDetails page
│   │   └── Home.css          # Styles for the Home page
│   ├── App.js                # Main React app component
│   ├── index.js              # Entry point for the React app
│   └── api/                  # API calls for fetching competition and user data
│       └── apiService.js     # Functions for making API calls (GitHub, competitions)
└── package.json              # Project metadata and dependencies
```




# CodeCall - Local Development Setup

This guide will walk you through the process of setting up and running the CodeCall platform locally for development. Follow each step carefully to ensure the environment is properly configured.

## Prerequisites

Before running the project locally, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/en/download/) (v14 or above)
- [MongoDB](https://www.mongodb.com/try/download/community) (for running the local database)
- [Git](https://git-scm.com/downloads)

## 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/CodeCall123/codecallcompetition
cd codecallcompetition
# For the backend
cd backend
npm install

# For the frontend
cd ../frontend
npm install

Running server(make sure you are in the backend folder):
mv .env.local .env
Ensure you have the following in your env:
MONGO_URI=mongodb://localhost:27017/codecall_local
PORT=5001
REACT_APP_GITHUB_CLIENT_ID=<your_github_client_id>
GITHUB_CLIENT_ID=<your_github_client_id>
GITHUB_CLIENT_SECRET=<your_github_client_secret>
GITHUB_ORG=<your_github_org>
GITHUB_ADMIN_TOKEN=<your_github_admin_token>
ZKSYNC_MAINNET_URL=https://zksync-mainnet.infura.io/v3/<your_infura_project_id>
node server

Running Frontend:
cd ../frontend
mv .env.local .env
Ensure you have the following in your env:
REACT_APP_GITHUB_CLIENT_ID=<your_github_client_id>
REACT_APP_REDIRECT_URI=http://localhost:3000/auth/callback
REACT_APP_BACKEND_URL=http://localhost:5001
npm start


database:
Make sure MongoDB is running on your local machine. You can do this via the command line or use a GUI tool like MongoDB Compass. For command line users, you can start MongoDB using:
mongod


Optional: Fill thedatabase:
cd backend
node seed/seed.js




```
## Usage

- **Browse Competitions:** Open the app and view the list of competitions on the main page.
- **Competition Details:** Click on a competition to view more details, including submission deadlines, judging periods, and reward distribution.
- **Submit Code:** Once authenticated with GitHub, users can view repository contents and submit pull requests via GitHub.

## GitHub Integration

This app integrates with GitHub to pull data about repositories associated with each competition:

- **Repository Browsing:** View files and folders in competition repositories.
- **Pull Requests:** Users can submit their pull requests directly from the app. Pull requests are automatically displayed under their submissions section.




## Contribution Guidelines

If you would like to contribute to the project:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes.
4. Ensure that tests pass and linting rules are followed.
5. Submit a pull request to the main repository.


## Contact

For more information or questions, feel free to reach out via [CodeCall](https://www.codecall.xyz) or open an issue in the repository.
