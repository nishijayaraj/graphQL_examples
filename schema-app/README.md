npm start

In graphiQL editor at http://localhost:9000/graphiql

Type the following:
{
greeting
students {
id
firstName
lastName
}
}

Expected result:
{
"data": {
"greeting": "hello from TutorialsPoint !!!",
"students": [
{
"id": "S1001",
"firstName": "Mohtashim",
"lastName": "Mohammad"
},
{
"id": "S1002",
"firstName": "Kannan",
"lastName": "Sudhakaran"
},
{
"id": "S1003",
"firstName": "Kiran",
"lastName": "Panigrahi"
}
]
}
}
