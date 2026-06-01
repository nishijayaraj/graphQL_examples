const db = require("./db");

// Query resolvers - handle fetching data
const QueryResolvers = {
  student: async (_, args, context) => {
    try {
      const student = db.studentById(args.id);
      if (!student) {
        throw new Error(`Student with id ${args.id} not found`);
      }
      return student;
    } catch (error) {
      console.error("Error fetching student:", error.message);
      throw error;
    }
  },

  students: async (_, args, context) => {
    try {
      const offset = args.offset || 0;
      const limit = args.limit || 10;
      return db.allStudents(offset, limit);
    } catch (error) {
      console.error("Error fetching students:", error.message);
      throw error;
    }
  },

  college: async (_, args, context) => {
    try {
      const college = db.collegeById(args.id);
      if (!college) {
        throw new Error(`College with id ${args.id} not found`);
      }
      return college;
    } catch (error) {
      console.error("Error fetching college:", error.message);
      throw error;
    }
  },

  colleges: async (_, args, context) => {
    try {
      const offset = args.offset || 0;
      const limit = args.limit || 10;
      return db.allColleges(offset, limit);
    } catch (error) {
      console.error("Error fetching colleges:", error.message);
      throw error;
    }
  },
};

// Mutation resolvers - handle creating, updating, and deleting data
const MutationResolvers = {
  createStudent: async (_, args, context) => {
    try {
      if (!args.input.email || !args.input.collegeId) {
        throw new Error("Email and collegeId are required");
      }
      const student = db.createStudent(args.input);
      return student;
    } catch (error) {
      console.error("Error creating student:", error.message);
      throw new Error(`Failed to create student: ${error.message}`);
    }
  },

  updateStudent: async (_, args, context) => {
    try {
      const student = db.updateStudent(args.id, args.input);
      return student;
    } catch (error) {
      console.error("Error updating student:", error.message);
      throw new Error(`Failed to update student: ${error.message}`);
    }
  },

  deleteStudent: async (_, args, context) => {
    try {
      const student = db.deleteStudent(args.id);
      return student;
    } catch (error) {
      console.error("Error deleting student:", error.message);
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  },

  createCollege: async (_, args, context) => {
    try {
      if (
        !args.input.name ||
        !args.input.location ||
        args.input.rating === undefined
      ) {
        throw new Error("name, location, and rating are required");
      }
      const college = db.createCollege(args.input);
      return college;
    } catch (error) {
      console.error("Error creating college:", error.message);
      throw new Error(`Failed to create college: ${error.message}`);
    }
  },

  updateCollege: async (_, args, context) => {
    try {
      const college = db.updateCollege(args.id, args.input);
      return college;
    } catch (error) {
      console.error("Error updating college:", error.message);
      throw new Error(`Failed to update college: ${error.message}`);
    }
  },

  deleteCollege: async (_, args, context) => {
    try {
      const college = db.deleteCollege(args.id);
      return college;
    } catch (error) {
      console.error("Error deleting college:", error.message);
      throw new Error(`Failed to delete college: ${error.message}`);
    }
  },
};

// Field resolvers - resolve nested fields
const FieldResolvers = {
  // Resolve college field on Student type
  Student: {
    college: (student, args, context) => {
      try {
        if (!student.collegeId) {
          return null;
        }
        return db.getCollegeById(student.collegeId);
      } catch (error) {
        console.error("Error resolving college for student:", error.message);
        return null;
      }
    },
  },

  // Resolve students field on College type
  College: {
    students: (college, args, context) => {
      try {
        return db.getStudentsByCollege(college.id);
      } catch (error) {
        console.error("Error resolving students for college:", error.message);
        return [];
      }
    },
  },
};

module.exports = {
  Query: QueryResolvers,
  Mutation: MutationResolvers,
  ...FieldResolvers,
};
