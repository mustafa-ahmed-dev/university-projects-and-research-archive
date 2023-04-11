import { faker } from "@faker-js/faker";

interface College {
  name: string;
  departments: string[];
}

export interface CollegeData {
  name: string;
  departments: {
    name: string;
    collegeId: string;
  }[];
}

const colleges: College[] = [
  {
    name: "Science",
    departments: [
      "Biology",
      "Computer Science and IT",
      "Physics",
      "Chemistry",
      "Mathematics",
      "Geology",
      "Earth Sciences And Petroleum",
      "Environmental Science And Health",
    ],
  },
  {
    name: "Engineering",
    departments: [
      "Civil Engineering",
      "Electrical Engineering",
      "Mechanical And Mechatronics Engineering",
      "Software Engineering",
      "Dams And Water Resources Engineering",
      "Geomatics (Surveying) Engineering",
      "Chemical And Petrochemical Engineering",
      "Aviation Engineering",
    ],
  },
  {
    name: "Education",
    departments: [
      "Chemistry",
      "Biology",
      "Mathematics",
      "Physics",
      "English Language",
      "Arabic Language",
      "Kurdish Language",
      "Syriac Language",
      "Education And Psychological Counselings",
      "Special Education",
    ],
  },
];

export default colleges;
