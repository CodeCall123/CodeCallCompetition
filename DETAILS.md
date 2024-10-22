
# App Description

The application is a competitive platform that allows users to participate in coding competitions, track their progress, and manage their profiles. Users can connect via GitHub, view and edit their profiles, view leaderboard rankings, and participate in competitions. The app integrates with MongoDB for data storage and GitHub for authentication and repository management.

## To-Do List for Optimization and Bug Fixing

### Security Enhancements:
- Implement advanced encryption for user data stored in MongoDB.
- Ensure secure transmission of data by enforcing HTTPS and using secure cookies.
- Validate and sanitize all user inputs to prevent injection attacks.
- Implement rate limiting to prevent brute force attacks on login endpoints.

### Performance Optimization:
- Optimize MongoDB queries for faster data retrieval, especially on leaderboard and profile pages.
- Implement database indexing where necessary to improve query performance.
- Use caching mechanisms like Redis for frequently accessed data to reduce load times.
- Minimize the size of API responses by using selective data fetching (e.g., GraphQL or MongoDB projections).
- Optimize image loading by using lazy loading and serving optimized image formats (e.g., WebP).

### User Experience Improvements:
- Improve the loading times of the competition and leaderboard pages by optimizing the data fetch process.
- Add a loading spinner or progress bar during data fetching to enhance user experience.
- Ensure the user interface is responsive and performs well on various screen sizes.
- Fix any issues with folder expansion in the repository view to avoid flickering or loading failures.

### Bug Fixing:
- Address any existing bugs related to profile updates, including social link validation.
- Fix issues with folder expansion and file viewing in the competition repository section.
- Resolve any errors related to authentication, especially around GitHub OAuth integration.
- Test and fix any edge cases where the application might crash or behave unexpectedly.

### Code Optimization:
- Refactor and clean up the codebase to reduce redundancy and improve readability.
- Implement code splitting and lazy loading for React components to improve initial load times.
- Conduct a thorough audit of dependencies and remove any unused or outdated libraries.

### Functionality:
- Recognise github labels in commits and PRs and display them next to submissions
- Recognise github labels in commits and PRs and display and calculate earnings based on the label type: Feature, Bug, Optimisation
- Currently competition details are updated only when the "addSampleCompetitions" script is called, implement a method to update the competition details (how to, repo etc.) dynamically
- Clicking the "become a reviewer" button should assign the user with the contributor role on github and allow them to approve or deny PRs from other users (only reviewers may do this)
- Implement a notifications icon next to the github username on the navbar which notifies the user when their PR was approved or a competition they have commited code to entered a new state (Live, Reviewing, Ended)
- When a competition has ended, no one should be able to create other PRs for the given repo
- Add serverside access api access to be able to modify the readme file for the task list in case we want to add bold letters or update a task


## Focus Areas
- **Security**: Enhance encryption and data protection mechanisms.
- **Performance**: Speed up MongoDB operations and overall application load times.
- **User Experience**: Smoothen interactions, especially in dynamic sections like the competition repository view.
- **Reliability**: Ensure the app is free of bugs and can handle edge cases gracefully.

These optimizations aim to make the application faster, more secure, and more user-friendly.
