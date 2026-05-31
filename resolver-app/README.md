npm start

In graphiQL editor at http://localhost:9000/graphiql

Type the following:
{  
 studentById(id:"S1001") {
id
firstName
}
}

Expected result:
{
"data": {
"studentById": {
"id": "S1001",
"firstName": "Mohtashim"
}
}
}
