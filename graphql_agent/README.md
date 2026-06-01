# List of first 1 - 10 students

query {
students(offset: 0, limit: 10) {
total
offset
limit
items {
id
firstName
lastName
email
collegeId
college {
id
name
location
rating
}
}
}
}

# Expected result

{
"data": {
"students": {
"total": 4,
"offset": 0,
"limit": 10,
"items": [
{
"id": "S1001",
"firstName": "Mohtashim",
"lastName": "Mohammad",
"email": "mohtashim.mohammad@tutorialpoint.org",
"collegeId": "col-102",
"college": {
"id": "col-102",
"name": "CUSAT",
"location": "Kerala",
"rating": 4.5
}
},
{
"id": "S1002",
"firstName": "Kannan",
"lastName": "Sudhakaran",
"email": "kannan.sudhakaran@tutorialpoint.org",
"collegeId": "col-101",
"college": {
"id": "col-101",
"name": "AMU",
"location": "Uttar Pradesh",
"rating": 5
}
},
{
"id": "S1003",
"firstName": "Kiran",
"lastName": "Panigrahi",
"email": "kiran.panigrahi@tutorialpoint.org",
"collegeId": "col-101",
"college": {
"id": "col-101",
"name": "AMU",
"location": "Uttar Pradesh",
"rating": 5
}
},
{
"id": "BkFpDhKlfe",
"firstName": "Tim",
"lastName": "George",
"email": "tim.george@tutorialpoint.org",
"collegeId": "col-102",
"college": {
"id": "col-102",
"name": "CUSAT",
"location": "Kerala",
"rating": 4.5
}
}
]
}
}
}

## Get details of specific student

{student(id: "S1001") {
id
firstName
lastName
email
collegeId
college {
id
name
location
rating
}
}
}

# Expected result

{
"data": {
"student": {
"id": "S1001",
"firstName": "Mohtashim",
"lastName": "Mohammad",
"email": "mohtashim.mohammad@tutorialpoint.org",
"collegeId": "col-102",
"college": {
"id": "col-102",
"name": "CUSAT",
"location": "Kerala",
"rating": 4.5
}
}
}
}

---

Mutation

---

mutation CreateStudent($input: StudentInput!) {
createStudent(input: $input) {
id
firstName
lastName
email
collegeId
college {
id
name
}
}
}

# query varaible

{
"input": {
"id": "S010",
"firstName": "Rahul",
"lastName": "Sharma",
"email": "rahul.sharma@example.com",
"password": "password123",
"collegeId": "col-101"
}
}

# Expected output

{
"data": {
"createStudent": {
"id": "S010",
"firstName": "Rahul",
"lastName": "Sharma",
"email": "rahul.sharma@example.com",
"collegeId": "col-101",
"college": {
"id": "col-101",
"name": "AMU"
}
}
}
}
