# GraphQL Express Server with notarealdb

**Purpose:** Build a production-ready GraphQL API server using Express.js and notarealdb, with auto-generated schema and resolvers from JSON data files.

**Scope:** Workspace-scoped skill for creating GraphQL servers with file-based data sources.

**Complexity:** Multi-step workflow with quality gates.

---

## Workflow Overview

### Phase 1: Project Setup
1. **Initialize structure** - Create directory layout matching the specification
2. **Organize data files** - Place JSON files in `/data` folder
3. **Analyze data schema** - Examine JSON structure to identify types and relationships

### Phase 2: GraphQL Schema Generation
1. **Identify entity types** - Generate one GraphQL type per JSON file (e.g., `students.json` → `Student` type)
2. **Map relationships** - Identify foreign keys and define one-to-many/many-to-one relationships
3. **Define queries** - Create root Query type with:
   - Get single entity by ID (e.g., `student(id: String!)`)
   - Get all entities with pagination (e.g., `students(offset: Int, limit: Int)`)
   - Get related entities (e.g., `college` field on Student type)
4. **Define mutations** - Create CRUD operations:
   - `create{Entity}` - Add new record
   - `update{Entity}` - Modify existing record
   - `delete{Entity}` - Remove record
5. **Pagination types** - Define `PaginatedResult` or similar wrapper:
   - `items: [{Entity}!]!` - Array of entities
   - `total: Int!` - Total count of records
   - `offset: Int!` - Current offset
   - `limit: Int!` - Current limit

### Phase 3: Database Layer (db.js)
1. **Initialize notarealdb collections** - Create one collection per data file
2. **Implement data access methods** - Provide functions for CRUD operations
3. **Add pagination support** - Implement `offset` and `limit` filtering in list queries
4. **Handle relationships** - Implement foreign key resolution methods (e.g., `getCollegeById()`)
5. **Error handling** - Return `null` or throw errors for missing records (resolvers decide handling)

### Phase 4: Resolver Implementation
1. **Query resolvers** - Implement query handlers to fetch data
2. **Mutation resolvers** - Implement create/update/delete handlers
3. **Field resolvers** - Resolve nested fields (e.g., `Student.college()`)
4. **Error handling** - Add validation and meaningful error messages

### Phase 5: Server Configuration
1. **Express setup** - Initialize Express app with middleware
2. **Apollo Server** - Configure GraphQL endpoint at `/graphql`
3. **Port configuration** - Default to port 9000
4. **Module format** - Use CommonJS (`require`/`module.exports`)

---

## Error Handling Patterns

**Use try-catch in resolvers** with consistent error responses:

```javascript
// Pattern: Catch database errors and return meaningful messages
const createStudent = async (_, args, { db }) => {
  try {
    // Validation
    if (!args.input.email || !args.input.collegeId) {
      throw new Error('Email and collegeId are required');
    }
    
    // Operation
    const student = db.createStudent(args.input);
    return student;
  } catch (error) {
    console.error('Error creating student:', error.message);
    throw new Error(`Failed to create student: ${error.message}`);
  }
};
```

**Error scenarios to handle:**
- Missing required fields (validation errors)
- Record not found (404-style errors)
- Invalid foreign keys (referential integrity)
- Duplicate IDs (if applicable)

---

## Server Configuration

### Phase 6: Quality & Testing
1. **Code review checklist:**
   - [ ] All JSON files have corresponding GraphQL types
   - [ ] Relationships correctly modeled (check foreign keys)
   - [ ] All CRUD operations implemented for each entity
   - [ ] Error handling for missing records/invalid input
   - [ ] CommonJS modules throughout
   - [ ] Production-quality comments for complex logic
   
2. **Test coverage:**
   - [ ] npm install succeeds without warnings
   - [ ] npm start runs without errors
   - [ ] GraphQL endpoint accessible at `http://localhost:9000/graphql`
   - [ ] Sample queries execute successfully
   - [ ] Sample mutations execute successfully

---

## Decisions & Branching

**Q: How many data files?**
- Single file → Simpler mutations, fewer relationships
- Multiple files → More complex relationship mapping, consider circular dependencies

**Q: Should relationships be bidirectional?**
- Yes → Add field resolvers to populate related data from foreign keys
- Example: `Student` has `college` field; `College` has `students` field

**Q: Complex validation needed?**
- Yes → Add validation in mutation resolvers (check ID format, required fields, etc.)
- No → Basic null checks only

**Q: Default pagination limits?**
- Recommended: `limit: 10, offset: 0` as defaults
- Handle edge cases: negative values, offset beyond total records

---

## Output Artifacts

Generated files:
- `package.json` - Dependencies (apollo-server-express, express, notarealdb)
- `server.js` - Express + Apollo configuration
- `db.js` - notarealdb collections and CRUD methods
- `schema.graphql` - Type definitions and root Query/Mutation
- `resolvers.js` - Query/Mutation/Field resolvers
- Example queries and mutations (documentation)

---

## Quality Criteria

✓ **Code Quality**
- Comments on all non-obvious logic
- Consistent naming (camelCase for fields, PascalCase for types)
- Error messages are descriptive
- No hardcoded values (use env vars for port)

✓ **GraphQL Schema**
- Non-null fields marked with `!` where appropriate
- Return types clearly specified
- Arguments documented in schema
- Pagination fields included in list queries (offset, limit, total)

✓ **Performance**
- Resolvers avoid N+1 queries (use batch loaders if needed)
- Data access methods are synchronous/consistent
- Pagination prevents loading entire datasets

✓ **Error Handling**
- All resolvers wrapped in try-catch blocks
- Meaningful error messages for debugging
- Validation errors caught before database operations

✓ **Runnable**
- `npm install` → `npm start` workflow works end-to-end
- No external database required
- GraphQL playground accessible and functional

---

## Example Prompts to Invoke This Skill

- "Build a GraphQL API for my Express app with students and colleges data using notarealdb"
- "Generate GraphQL schema and resolvers from JSON files in the `/data` folder"
- "Create a production-ready GraphQL server with CRUD mutations"
- "Set up Apollo Server with Express on port 9000 using file-based data"

---

## Related Customizations

After creating this skill:
- Create a **pagination-patterns** skill for cursor-based pagination and relay connections
- Create a **testing-skill** for GraphQL integration tests
- Create a **graphql-optimization** skill for adding caching and data loaders
- Create an **error-recovery** skill for production error handling and logging
- Extend with **authentication** patterns for securing GraphQL endpoints
