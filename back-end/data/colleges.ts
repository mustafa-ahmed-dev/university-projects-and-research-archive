export interface CollegeSeed {
  name: string;
  departments: {
    name: string;
  }[];
}

const colleges: CollegeSeed[] = [
  {
    name: "Eduction",
    departments: [
      { name: "English Language" },
      { name: "Kurdish Language" },
      { name: "Arabic Language" },
      { name: "Chemistry" },
      { name: "Physics" },
      { name: "Biology" },
      { name: "Mathematics" },
    ],
  },
  {
    name: "Science",
    departments: [
      { name: "Computer Science and IT" },
      { name: "Chemistry" },
      { name: "Physics" },
      { name: "Biology" },
      { name: "Geology" },
      { name: "Mathematics" },
    ],
  },
  {
    name: "Engineering",
    departments: [
      { name: "Mechanic and Mechatronics Engineering" },
      { name: "Electrical Engineering" },
      { name: "Civil Engineering" },
      { name: "Architect" },
      { name: "Software Engineering" },
      { name: "Dams and Water Resources Engineering" },
      { name: "Petrochemical Engineering" },
    ],
  },
  {
    name: "Languages",
    departments: [
      { name: "English" },
      { name: "Arabic" },
      { name: "Kurdish" },
      { name: "French" },
      { name: "Chinese" },
    ],
  },
  {
    name: "Law",
    departments: [{ name: "Law" }],
  },
];

export default colleges;
