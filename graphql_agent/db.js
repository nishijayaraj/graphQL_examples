const { DataStore } = require('notarealdb');
const path = require('path');

// Initialize collections from JSON files
const db = new DataStore(path.join(__dirname, 'data'));

// Students collection methods
const students = db.collection("students");
const colleges = db.collection("colleges");

module.exports = {
  // Student queries
  allStudents: (offset = 0, limit = 10) => {
    const allStudents = students.list();
    const total = allStudents.length;
    const paginatedStudents = allStudents.slice(offset, offset + limit);
    return {
      items: paginatedStudents,
      total,
      offset,
      limit,
    };
  },

  studentById: (id) => {
    try {
      return students.get(id);
    } catch (error) {
      return null;
    }
  },

  getCollegeById: (collegeId) => {
    try {
      return colleges.get(collegeId);
    } catch (error) {
      return null;
    }
  },

  // College queries
  allColleges: (offset = 0, limit = 10) => {
    const allColleges = colleges.list();
    const total = allColleges.length;
    const paginatedColleges = allColleges.slice(offset, offset + limit);
    return {
      items: paginatedColleges,
      total,
      offset,
      limit,
    };
  },

  collegeById: (id) => {
    try {
      return colleges.get(id);
    } catch (error) {
      return null;
    }
  },

  getStudentsByCollege: (collegeId) => {
    const allStudents = students.list();
    return allStudents.filter((student) => student.collegeId === collegeId);
  },

  // Student mutations
  createStudent: (input) => {
    // Validation
    if (
      !input.id ||
      !input.firstName ||
      !input.lastName ||
      !input.email ||
      !input.collegeId
    ) {
      throw new Error(
        "id, firstName, lastName, email, and collegeId are required",
      );
    }

    // Check if student already exists
    const allStudents = students.list();
    if (allStudents.find((s) => s.id === input.id)) {
      throw new Error(`Student with id ${input.id} already exists`);
    }

    // Check if college exists
    const allColleges = colleges.list();
    if (!allColleges.find((c) => c.id === input.collegeId)) {
      throw new Error(`College with id ${input.collegeId} does not exist`);
    }

    const newStudent = {
      id: input.id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: input.password || "pass123",
      collegeId: input.collegeId,
    };

    students.create(newStudent);
    return newStudent;
  },

  updateStudent: (id, input) => {
    const allStudents = students.list();
    const studentIndex = allStudents.findIndex((s) => s.id === id);

    if (studentIndex === -1) {
      throw new Error(`Student with id ${id} not found`);
    }

    // Check if college exists if collegeId is being updated
    if (input.collegeId) {
      const allColleges = colleges.list();
      if (!allColleges.find((c) => c.id === input.collegeId)) {
        throw new Error(`College with id ${input.collegeId} does not exist`);
      }
    }

    const updatedStudent = { ...allStudents[studentIndex], ...input };
    students.update(updatedStudent);
    return updatedStudent;
  },

  deleteStudent: (id) => {
    const allStudents = students.list();
    const student = allStudents.find((s) => s.id === id);

    if (!student) {
      throw new Error(`Student with id ${id} not found`);
    }

    students.delete(id);
    return student;
  },

  // College mutations
  createCollege: (input) => {
    // Validation
    if (
      !input.id ||
      !input.name ||
      !input.location ||
      input.rating === undefined
    ) {
      throw new Error("id, name, location, and rating are required");
    }

    // Check if college already exists
    const allColleges = colleges.list();
    if (allColleges.find((c) => c.id === input.id)) {
      throw new Error(`College with id ${input.id} already exists`);
    }

    const newCollege = {
      id: input.id,
      name: input.name,
      location: input.location,
      rating: input.rating,
    };

    colleges.create(newCollege);
    return newCollege;
  },

  updateCollege: (id, input) => {
    const allColleges = colleges.list();
    const collegeIndex = allColleges.findIndex((c) => c.id === id);

    if (collegeIndex === -1) {
      throw new Error(`College with id ${id} not found`);
    }

    const updatedCollege = { ...allColleges[collegeIndex], ...input };
    colleges.update(updatedCollege);
    return updatedCollege;
  },

  deleteCollege: (id) => {
    const allColleges = colleges.list();
    const college = allColleges.find((c) => c.id === id);

    if (!college) {
      throw new Error(`College with id ${id} not found`);
    }

    colleges.delete(id);
    return college;
  },
};
