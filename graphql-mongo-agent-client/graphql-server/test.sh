#!/bin/bash

# GraphQL Server Test Script
# Tests the MongoDB GraphQL server with the actual data structure

echo "🧪 Testing GraphQL Server..."
echo ""

# Test 1: Health Check
echo "📍 Test 1: Health Check"
curl -s http://localhost:9000/health | jq . || echo "❌ Health check failed"
echo ""

# Test 2: Query All Customers
echo "📍 Test 2: Query All Customers"
curl -s -X POST http://localhost:9000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ customers { items { _id firstName lastName email phone status createdAt } total } }"}' | jq .
echo ""

# Test 3: Query Single Customer
echo "📍 Test 3: Query Single Customer (CUST001)"
curl -s -X POST http://localhost:9000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ customer(id: \"CUST001\") { _id firstName lastName email status address { city country } } }"}' | jq .
echo ""

# Test 4: Query Customer with Orders
echo "📍 Test 4: Query Customer with Orders"
curl -s -X POST http://localhost:9000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ customer(id: \"CUST001\") { _id firstName orders { _id total status } } }"}' | jq .
echo ""

echo "✅ Tests Complete!"
