const mongoose = require('mongoose');
const MentalHealth = require('./models/mentalHealthModel');

mongoose.connect('mongodb://localhost:27017/your_database_name');

MentalHealth.insertMany([
  {
    name: "Depression",
    description: "Depression is a common mental disorder...",
    copingStrategies: [
      "Regular exercise and physical activity",
      "Maintaining a healthy sleep schedule",
      "Talking to a therapist or counselor"
    ]
  },
  {
    name: "Anxiety Disorders",
    description: "Anxiety disorders involve excessive fear...",
    copingStrategies: [
      "Deep breathing exercises",
      "Limiting caffeine and alcohol intake",
      "Progressive muscle relaxation"
    ]
  },{
    name: "Bipolar Disorder",
    description: "Bipolar disorder causes extreme mood swings, including episodes of mania and depression. It affects energy levels, activity, and the ability to function daily.",
    copingStrategies: [
      "Maintaining a consistent daily routine",
      "Medication prescribed by a psychiatrist",
      "Tracking mood changes in a journal",
      "Avoiding alcohol and drug use",
      "Building a strong support system",
    ],
  },
  {
    name: "Obsessive-Compulsive Disorder (OCD)",
    description: "OCD is characterized by unwanted, intrusive thoughts (obsessions) and repetitive behaviors (compulsions) that individuals feel driven to perform.",
    copingStrategies: [
      "Exposure and response prevention (ERP) therapy",
      "Cognitive-behavioral therapy (CBT)",
      "Practicing mindfulness techniques",
      "Using relaxation exercises",
      "Gradual exposure to fears",
    ],
  },
  {
    name: "Post-Traumatic Stress Disorder (PTSD)",
    description: "PTSD develops after experiencing or witnessing a traumatic event. Symptoms include flashbacks, nightmares, severe anxiety, and emotional distress.",
    copingStrategies: [
      "Seeking trauma-focused therapy",
      "Practicing grounding techniques",
      "Engaging in creative outlets (art, music, writing)",
      "Building a strong support system",
      "Practicing self-care and relaxation techniques",
    ],
  },
  // Add more if needed
])
  .then(() => {
    console.log("Seeded mental health data");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Seeding error:", err);
    mongoose.disconnect();
  });
