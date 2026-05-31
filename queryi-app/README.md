npm start

In graphiQL editor at http://localhost:9000/graphiql

# StudentById

{  
 studentById(id:"S1001") {
id
firstName
lastName
fullName
}
}
Response

---

{
"data": {
"studentById": {
"id": "S1001",
"firstName": "Mohtashim",
"lastName": "Mohammad",
"fullName": "Mohtashim:Mohammad"
}
}
}

# Query variables

In graphiql query variables section,

{
"ID_Variable": "S1001"
}

then in query text box
query myQuery($ID_Variable:ID!) {
   studentById(id:$ID_Variable){
firstName
}
}
expected result
================

{
"data": {
"studentById": {
"firstName": "Mohtashim"
}
}
}

# Type the following:

{
students {
id
fullName
college {
name
}
}
}

# Expected result:

{
"data": {
"students": [
{
"id": "S1001",
"fullName": "Mohtashim:Mohammad",
"college": {
"name": "CUSAT"
}
},
{
"id": "S1002",
"fullName": "Kannan:Sudhakaran",
"college": {
"name": "AMU"
}
},
{
"id": "S1003",
"fullName": "Kiran:Panigrahi",
"college": {
"name": "AMU"
}
}
]
}
}
