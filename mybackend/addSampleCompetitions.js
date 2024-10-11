const mongoose = require('mongoose');
const fetch = require('node-fetch'); 

const Competition = require('./models/Competition.js');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

  const fetchReadme = async (repoUrl) => {
    try {
      // Extract the repo path from the full URL
      const repoPath = repoUrl.replace("https://github.com/", "");
      const apiUrl = `https://api.github.com/repos/${repoPath}/readme`;
      console.log(`Fetching README from: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3.raw' }
      });
      const data = await response.text(); 
      console.log('README fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching README:', error.message);
      return 'Guide on how to start...'; 
    }
  };
  const fetchFileFromRepo = async (repoUrl, fileName) => {
    try {
      // Extract the repo path from the full URL
      const repoPath = repoUrl.replace("https://github.com/", "");
      const apiUrl = `https://api.github.com/repos/${repoPath}/contents/${fileName}`;
      console.log(`Fetching ${fileName} from: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3.raw' }
      });
      const data = await response.text(); 
      console.log(`${fileName} fetched successfully:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${fileName}:`, error.message);
      return `Guide on how to start...`; 
    }
  };
  
  
const addCompetitions = async () => {
  try {


    const sampleCompetitions = [
 
      {
        name: "Code Call",
        description: "Our web app is in our web app, that's right! We are looking to optimise our app, add more features and secure it as much as possible.",
        status: "Live",
        reward: 6000,
        points: 7000,
        languages: ["React", "JavaScript"],
        types: ["Security", "FrontEnd"],
        startDate: "2024-10-12T12:00:00Z", 
        endDate: "2024-10-25T12:00:00Z",  
        image: "https://i.ibb.co/0tqYGwN/socialmediaicon-2.png",
        websiteLink: "https://codecallappfrontend.vercel.app",
        repositoryLink: "https://github.com/CodeCall123/repo1",
        scope: "The scope of the project is all the files included in the public repo exluding readme.md, vercel.json and the assets folder",
        judges: {
          leadJudge: null,
          judges: [] 
        },
        submissions: []
      },
      {
        name: "Jerman Cars",
        description: "JERMAN is a family run car dealership which imports cars mainly from JAPAN and the UK.",
        status: "Live",
        reward: 1000,
        points: 4000,
        languages: ["HTML", "JavaScript"],
        types: ["FrontEnd"],
        startDate: "2024-10-12T12:00:00Z", 
        endDate: "2024-10-25T12:00:00Z",  
        image: "https://i.ibb.co/GT1qj3g/Screenshot-2024-10-10-at-19-47-45.png",
        websiteLink: "https://google.com",
        repositoryLink: "https://github.com/CodeCall123/repo1",
        scope: "The scope of Jerman cars includes the main car dealership website as well as the admin panel which allows the dealership to add new cars to their website.",
        judges: {
          leadJudge: null,
          judges: [] 
        },
        submissions: []
      },


    ];
 // Delete all existing competitions
 await Competition.deleteMany({});
 console.log('All existing competitions deleted.');

 for (const competition of sampleCompetitions) {
   const readmeContent = await fetchFileFromRepo(competition.repositoryLink, 'README.md');
   const detailsContent = await fetchFileFromRepo(competition.repositoryLink, 'DETAILS.md');
   competition.howToGuide = readmeContent;
   competition.competitionDetails = detailsContent;
 }

 await Competition.insertMany(sampleCompetitions);
 console.log('Sample competitions added successfully.');
 
 mongoose.connection.close();
} catch (error) {
 console.error('Error adding sample competitions:', error);
 mongoose.connection.close(); 
}
};

addCompetitions();