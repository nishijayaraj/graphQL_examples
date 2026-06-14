# Connection string

mongodb://localhost:27017

# How to start the appilication

    - npm run build
    - npm start
    - This will run the mcp server
    - Add this mcp server to your workspace ( using stdio)
      {
         "servers": {
    	     "graphql-mongo-agent": {
    		     "type": "stdio",
    		     "command": "node",
    		     "args": [
    			   "/home/hp/Documents/gen-ai-samples/graphql-mongo-mcp/dist/server.js"
    		    ]
    	     }
        },
        "inputs": []
      }

## user input : Generate GraphQL query for customer information

- This will ask for connection string and user is supposed to provide the same mongodb://localhost:27017
- This gives the output

### output

     query {

customers {
\_id
firstName
lastName
email
phone
status
createdAt
}
}

The query retrieves all top-level customer fields from the MongoDB customers collection in your crm database. Note that nested address fields (street, city, state, country, postalCode) were detected but excluded from the basic query—you can add them if needed.

## Multi collection query

User Input :Generate GraphQL query to get customer name,address and all orders.

Expected output :
query {
customers {
firstName
lastName
address {
street
city
state
country
postalCode
}
orders {
\_id
orderNumber
orderDate
total
status
items
}
}
}
