const db = require("./db");
const Query = {
  greeting: () => {
    return "hello from  TutorialsPoint !!!";
  },
  students: () => db.students.list(), //This can be replaced by REST APIs or any other data source like MySQL, MongoDB etc. We are using notarealdb to keep it simple and focus on GraphQL
};

module.exports = { Query };
