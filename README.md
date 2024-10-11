
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


## Installation

To get started with the project:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/codecall-dashboard.git
   cd codecall-dashboard
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file, as shown above.

4. Start the development server:

   ```bash
   npm start
   ```

## Usage

- **Browse Competitions:** Open the app and view the list of competitions on the main page.
- **Competition Details:** Click on a competition to view more details, including submission deadlines, judging periods, and reward distribution.
- **Submit Code:** Once authenticated with GitHub, users can view repository contents and submit pull requests via GitHub.

## GitHub Integration

This app integrates with GitHub to pull data about repositories associated with each competition:

- **Repository Browsing:** View files and folders in competition repositories.
- **Pull Requests:** Users can submit their pull requests directly from the app. Pull requests are automatically displayed under their submissions section.

## Running Tests

To run tests, execute the following command:

```bash
npm test
```

This will run all tests defined in the `src` folder.

## Deployment

To deploy the project:

1. Ensure that environment variables are correctly set for production.
2. Build the project for production:

   ```bash
   npm run build
   ```

3. Deploy the `build` directory to your preferred hosting provider (e.g., Netlify, Vercel).

## Contribution Guidelines

If you would like to contribute to the project:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes.
4. Ensure that tests pass and linting rules are followed.
5. Submit a pull request to the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For more information or questions, feel free to reach out via [CodeCall](https://www.codecall.xyz) or open an issue in the repository.
