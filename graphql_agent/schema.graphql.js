const typeDefinitions = `
  # College type representing an educational institution
  type College {
    id: String!
    name: String!
    location: String!
    rating: Float!
    # Get all students enrolled in this college
    students: [Student!]!
  }

  # Student type representing a student enrolled in a college
  type Student {
    id: String!
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    collegeId: String!
    # Get the college this student is enrolled in
    college: College
  }

  # Paginated result wrapper for colleges
  type PaginatedColleges {
    items: [College!]!
    total: Int!
    offset: Int!
    limit: Int!
  }

  # Paginated result wrapper for students
  type PaginatedStudents {
    items: [Student!]!
    total: Int!
    offset: Int!
    limit: Int!
  }

  # Root Query type for fetching data
  type Query {
    # Get a single student by ID
    student(id: String!): Student
    # Get all students with optional pagination
    students(offset: Int = 0, limit: Int = 10): PaginatedStudents!
    # Get a single college by ID
    college(id: String!): College
    # Get all colleges with optional pagination
    colleges(offset: Int = 0, limit: Int = 10): PaginatedColleges!
  }

  # Input type for creating a student
  input StudentInput {
    id: String!
    firstName: String!
    lastName: String!
    email: String!
    password: String
    collegeId: String!
  }

  # Input type for updating a student
  input UpdateStudentInput {
    firstName: String
    lastName: String
    email: String
    password: String
    collegeId: String
  }

  # Input type for creating a college
  input CollegeInput {
    id: String!
    name: String!
    location: String!
    rating: Float!
  }

  # Input type for updating a college
  input UpdateCollegeInput {
    name: String
    location: String
    rating: Float
  }

  # Root Mutation type for modifying data
  type Mutation {
    # Create a new student
    createStudent(input: StudentInput!): Student!
    # Update an existing student
    updateStudent(id: String!, input: UpdateStudentInput!): Student!
    # Delete a student by ID
    deleteStudent(id: String!): Student!
    # Create a new college
    createCollege(input: CollegeInput!): College!
    # Update an existing college
    updateCollege(id: String!, input: UpdateCollegeInput!): College!
    # Delete a college by ID
    deleteCollege(id: String!): College!
  }
`;

module.exports = typeDefinitions;
