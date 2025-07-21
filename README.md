# Family Shapes Canvas - Data and UI Patterns

## Relationship Data Model

- **Parent-Child:** Only `parent` is stored for parent-child relationships, always from parent → child. No `child` direction is stored in the database.
- **Symmetric Relationships:** `partner` and `sibling` are stored in both directions (A→B and B→A).
- **Other Types:** `donor` and `gestational_carrier` are stored in the canonical direction (from donor/carrier to child).

## UI Display Logic

- The UI always infers the reciprocal label for display. For example, if A is parent of B, B will see A as their parent, and A will see B as their child.
- For symmetric relationships, both directions are shown as appropriate.

## D3 Layouts and Hierarchy

- All D3 layouts and hierarchy logic only use `parent` relationships for building the tree.
- Duplicate or reciprocal `child` relationships are ignored.

## External Connections Pattern

- If a person has connections to people not in the current tree, these are shown as external connections.
- The UI displays a summary (e.g., '+2 connections to people outside this tree') and allows expanding to view details of those external connections.

## Testing

- Tests cover:
  - Only `parent` for parent-child
  - Symmetric relationships
  - Edge cases (missing persons, circular, self-relationships)
  - External connections pattern

---

For more details, see the code and tests in the respective components and test files.
