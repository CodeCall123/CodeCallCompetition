const mongoose = require('mongoose');
const fetch = require('node-fetch');
const Training = require('./models/Training');
const { ObjectId } = require('mongoose').Types;
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

const fetchReadme = async (repoUrl) => {
  try {
    const apiUrl = `https://api.github.com/repos/${repoUrl}/readme`;
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    });
    return await response.text();
  } catch (error) {
    console.error('Error fetching README:', error.message);
    return 'Guide on how to start...';
  }
};
const fetchDetailsMd = async (repoUrl) => {
  try {
    const apiUrl = `https://api.github.com/repos/${repoUrl}/DETAILS.md`;
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' },
    });
    if (!response.ok) {
      throw new Error('Could not fetch DETAILS.md');
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error fetching DETAILS.md:', error.message);
    return 'No details available.';
  }
};
const addTrainingCompetitions = async () => {
  try {
    const readmeContent = await fetchReadme('CodeCall123/Zoo');
    const sampleTrainings = [
      {
        name: "Zoology",
        description: "Analyze the zoo data to make critical decisions in animal management.",
        status: "Live",
        points: 700,
        difficulty: "Intermediate",
        languages: ["Python"],
        types: ["Data Science"],
        trainingDetails: "In this challenge, you are tasked with managing a zoo. Like any succesful zoo owner, your 3 main concerns are: The well-being of the species, your profits and research efforts. Your zookeepers were kind enough to add all the data needed in a csv file for you to decide which animals to keep and which to release to the wild.",
        image: "https://www.shutterstock.com/image-vector/zoo-cartoon-people-family-animals-600nw-338189513.jpg",
        repositoryLink: "https://github.com/CodeCall123/Zoo",  
        howToGuide: readmeContent,
        judges: {
          leadJudge: null,
          judges: []
        },
        submissions: [],
        starterCode: `
    # Print your results here
    print("")  # First Task
    print("")  # Second Task
    print("")  # Third Task
    print("")  # Fourth Task
        `,
        tests: [
          {
            input: `
    # List of animals with their respective lifespan
    animals = [
        {"species": "Lion", "lifespan": 20},
        {"species": "Elephant", "lifespan": 70},
        {"species": "Giraffe", "lifespan": 25}
    ]
    
    # Task: Find the animal with the longest lifespan
    longest_living_animal = max(animals, key=lambda x: x['lifespan'])
    
    # Output just the species name
    print(longest_living_animal['species'])
            `,
            expectedOutput: "Elephant"
          },
          {
            input: `
    # List of animals with their respective feeding costs
    feeding_costs = [
        {"species": "Iguana", "gender": "Male", "cost_to_feed": 10},
        {"species": "Lion", "gender": "Female", "cost_to_feed": 50},
        {"species": "Peacock", "gender": "Male", "cost_to_feed": 30}
    ]
    
    # Task: Find the species that costs the most to feed
    most_expensive_to_feed = max(feeding_costs, key=lambda x: x['cost_to_feed'])
    
    # Output just the species name
    print(most_expensive_to_feed['species'])
            `,
            expectedOutput: "Lion"
          },
          {
            input: `
    # List of animals with their respective feeding costs
    animals_to_remove = [
        {"species": "Lion", "cost_to_feed": 50},
        {"species": "Elephant", "cost_to_feed": 70},
        {"species": "Giraffe", "cost_to_feed": 40},
        {"species": "Zebra", "cost_to_feed": 30},
        {"species": "Panda", "cost_to_feed": 60}
    ]
    
    # Task: Select animals to remove to minimize costs while keeping 20 animals
    # This is a simplified example, actual implementation will depend on the total number of animals
    animals_to_remove.sort(key=lambda x: x['cost_to_feed'], reverse=True)
    removed_animals = [animal['species'] for animal in animals_to_remove[:2]]
    
    # Output the species that should be removed
    print(removed_animals)
            `,
            expectedOutput: "Elephant, Panda"
          },
          {
            input: `
    # List of animals with their respective sprint speeds
    sprint_speeds = [
        {"species": "Marmoset", "speed": 30},  # speed in km/h
        {"species": "Tegu", "speed": 20},
        {"species": "Anaconda", "speed": 10}
    ]
    
    # Task: Determine the fastest animal over a quarter-mile
    fastest_animal = max(sprint_speeds, key=lambda x: x['speed'])
    
    # Output just the species name
    print(fastest_animal['species'])
            `,
            expectedOutput: "Marmoset, Tegu, Anaconda"
          }
        ],
        hints: [
          "Look at the Lifespan column to find the longest-living animal.",
          "Consider both cost and weight when determining the most expensive animal to feed.",
          "Optimize animal removal by balancing costs while retaining 20 species.",
          "Use sprint speed to estimate the fastest animal over a quarter mile."
        ]
      },
    ];
    

    await Training.deleteMany({});
    console.log('All existing trainings deleted.');

    await Training.insertMany(sampleTrainings);
    console.log('Sample training competitions added successfully.');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error adding training competitions:', error);
    mongoose.connection.close();
  }
};

addTrainingCompetitions();
