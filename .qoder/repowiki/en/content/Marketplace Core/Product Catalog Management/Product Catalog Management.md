# Product Catalog Management

<cite>
**Referenced Files in This Document**
- [App.tsx](file://src/App.tsx)
- [supabaseClient.ts](file://src/supabase/supabaseClient.ts)
- [dbService.ts](file://src/supabase/dbService.ts)
- [inquiryService.ts](file://src/supabase/inquiryService.ts)
- [supabase_schema.sql](file://supabase_schema.sql)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document explains the product catalog management system for menu items, including CRUD operations, category organization, featured highlighting, search, and vendor integration. It also outlines data models, database interactions via Supabase, filtering and sorting capabilities, and performance optimization techniques suitable for large catalogs. While inventory tracking is not implemented in the current schema, this guide clarifies where and how to extend it.

## Project Structure
The application is a React + TypeScript app using Vite. The core UI and business logic live in App.tsx. Database connectivity is provided by Supabase client configuration and optional service wrappers. The database schema is defined in a SQL migration file.

```mermaid
graph TB
subgraph "Frontend"
A["App.tsx"]
B["supabaseClient.ts"]
C["dbService.ts"]
D["inquiryService.ts"]
end
subgraph "Backend/DB"
E["Supabase (Postgres)"]
F["Schema: supabase_schema.sql"]
end
A --> B
A --> C
A --> D
B --> E
C --> E
D --> E
F --> E
```

**Diagram sources**
- [App.tsx](file://src/App.tsx)
- [supabaseClient.ts](file://src/supabase/supabaseClient.ts)
- [dbService.ts](file://src/supabase/dbService.ts)
- [inquiryService.ts](file://src/supabase/inquiryService.ts)
- [supabase_schema.sql](file://supabase_schema.sql)

**Section sources**
- [App.tsx](file://src/App.tsx)
- [supabaseClient.ts](file://src/supabase/supabaseClient.ts)
- [supabase_schema.sql](file://supabase_schema.sql)

## Core Components
- Data model for menu items: name, price, description, category, store association, featured flag, and image URL.
- Category organization: top-level categories with filtering and search across name, store, and description.
- Featured highlighting: boolean flag used to surface promoted items.
- Vendor integration: items are associated with a store name; vendors are modeled separately and linked through store_name.
- Database operations: direct Supabase calls from the UI; an optional dbService wrapper provides consistent error handling.

Key responsibilities:
- App.tsx manages state, UI flows, and persistence for menu items and related entities.
- supabaseClient.ts configures the Supabase client and validates environment variables.
- dbService.ts wraps Supabase calls with typed responses and error normalization.
- inquiryService.ts demonstrates a simple service pattern for DB operations.
- supabase_schema.sql defines tables, columns, and Row Level Security policies.

**Section sources**
- [App.tsx](file://src/App.tsx)
- [supabaseClient.ts](file://src/supabase/supabaseClient.ts)
- [dbService.ts](file://src/supabase/dbService.ts)
- [inquiryService.ts](file://src/supabase/inquiryService.ts)
- [supabase_schema.sql](file://supabase_schema.sql)

## Architecture Overview
The frontend loads initial data on mount, maintains local state for the marketplace, and persists changes directly to Supabase. Filtering and search are performed client-side using memoized computations.

```mermaid
sequenceDiagram
participant UI as "App.tsx"
participant Client as "supabaseClient.ts"
participant DB as "Supabase DB"
UI->>Client : Initialize client (env validation)
UI->>DB : SELECT menu_items (on mount)
DB-->>UI : Menu items array
UI->>UI : Map DB rows to MenuItem interface
UI->>UI : Apply filters (category, search)
UI->>DB : INSERT/UPDATE/DELETE (user actions)
DB-->>UI : Success/Error response
UI->>UI : Update local state and UI
```

**Diagram sources**
- [App.tsx](file://src/App.tsx)
- [supabaseClient.ts](file://src/supabase/supabaseClient.ts)

## Detailed Component Analysis

### Data Model and Schema
- Menu item fields: id, name, price, description, category, store_name, is_featured, created_at.
- Vendor fields: id, name, category, sub_type, rating, delivery_time, min_order, badge, image, approved, created_at.
- RLS policies enable full access for all roles in the current setup.

```mermaid
erDiagram
MENU_ITEMS {
text id PK
text name
numeric price
text description
text category
text store_name
boolean is_featured
timestamptz created_at
}
VENDORS {
text id PK
text name
text category
text sub_type
numeric rating
text delivery_time
numeric min_order
text badge
text image
boolean approved
timestamptz created_at
}
VENDORS ||--o{ MENU_ITEMS : "linked by store_name"
```

**Diagram sources**
- [supabase_schema.sql](file://supabase_schema.sql)

**Section sources**
- [supabase_schema.sql](file://supabase_schema.sql)

### CRUD Operations for Menu Items
- Create: Upload new product form constructs a payload and inserts into menu_items.
- Read: On mount, fetch all menu_items and map to local types.
- Update: Promote an item to featured by updating is_featured.
- Delete: Not currently exposed in the UI; can be added by extending the UI and adding a delete operation.

```mermaid
flowchart TD
Start([User Action]) --> Validate["Validate required fields"]
Validate --> Valid{"Valid?"}
Valid --> |No| ShowError["Show error toast"]
Valid --> |Yes| BuildPayload["Build payload<br/>id, name, price, description,<br/>category, store_name, is_featured"]
BuildPayload --> Insert["Insert into menu_items"]
Insert --> Success{"Success?"}
Success --> |No| HandleError["Handle error and show toast"]
Success --> |Yes| UpdateState["Update local state and clear form"]
UpdateState --> End([Done])
HandleError --> End
ShowError --> End
```

**Diagram sources**
- [App.tsx](file://src/App.tsx)

**Section sources**
- [App.tsx](file://src/App.tsx)

### Category Organization and Search
- Categories are selected via UI buttons that update activeCategory.
- Search queries filter across name, storeName, and description.
- Filtering is computed with useMemo for performance.

```mermaid
flowchart TD
A["Active Category"] --> F["Filter by category"]
B["Search Query"] --> G["Filter by name/store/description"]
F --> H["Combined Filtered Results"]
G --> H
H --> I["Render Grid"]
```

**Diagram sources**
- [App.tsx](file://src/App.tsx)

**Section sources**
- [App.tsx](file://src/App.tsx)

### Featured Item Highlighting
- Featured items are filtered by is_featured and displayed in a dedicated section.
- Promotion action updates is_featured to true for a given item.

```mermaid
sequenceDiagram
participant UI as "App.tsx"
participant DB as "Supabase DB"
UI->>UI : User clicks "Promote"
UI->>DB : UPDATE menu_items SET is_featured=true WHERE id=?
DB-->>UI : Success
UI->>UI : Refresh featured list and show success toast
```

**Diagram sources**
- [App.tsx](file://src/App.tsx)

**Section sources**
- [App.tsx](file://src/App.tsx)

### Inventory Tracking Mechanisms
- Current schema does not include stock levels or availability status.
- To implement:
  - Add columns such as stock_quantity, available (boolean), updated_at to menu_items.
  - Extend UI to adjust stock on add/remove and reflect availability.
  - Use optimistic UI updates and server-side validation for consistency.

[No sources needed since this section proposes extensions beyond current code]

### Integration with Vendor Profiles
- Items are associated with store_name; vendors are stored in a separate table.
- The UI displays vendors per category and shows their products when selected.

```mermaid
classDiagram
class Vendor {
+string id
+string name
+string category
+string subType
+number rating
+string deliveryTime
+number minOrder
+string badge
+string image
+boolean approved
}
class MenuItem {
+string id
+string name
+number price
+string description
+string category
+string storeName
+string image
+boolean isFeatured
}
Vendor "1" --> "many" MenuItem : "store_name links"
```

**Diagram sources**
- [supabase_schema.sql](file://supabase_schema.sql)
- [App.tsx](file://src/App.tsx)

**Section sources**
- [supabase_schema.sql](file://supabase_schema.sql)
- [App.tsx](file://src/App.tsx)

### Database Operations Using dbService Wrapper
- dbService wraps Supabase calls with a consistent Response type and error handling.
- Methods: select, insert, update.eq, delete.eq, rpc.
- Usage example pattern: db.from('menu_items').insert(payload).then(...)

```mermaid
classDiagram
class DbService {
+from(table)
}
class FromBuilder {
+select(columns)
+insert(payload)
+update(payload)
+delete()
+rpc(fnName, params)
}
DbService --> FromBuilder : "returns"
```

**Diagram sources**
- [dbService.ts](file://src/supabase/dbService.ts)

**Section sources**
- [dbService.ts](file://src/supabase/dbService.ts)

### Validation Rules and Upload Workflow
- Required fields for upload: title (name), price, store name.
- Optional fields: description, category defaults to a preset.
- On success, local state updates and a success toast is shown.

```mermaid
flowchart TD
S(["Submit Form"]) --> V["Validate required fields"]
V --> OK{"All valid?"}
OK --> |No| E["Show error toast"]
OK --> |Yes| P["Create payload"]
P --> U["Insert into menu_items"]
U --> R{"Insert ok?"}
R --> |No| EH["Handle error and toast"]
R --> |Yes| LS["Update local state and clear form"]
LS --> T["Show success toast"]
T --> Done(["Done"])
```

**Diagram sources**
- [App.tsx](file://src/App.tsx)

**Section sources**
- [App.tsx](file://src/App.tsx)

## Dependency Analysis
- App.tsx depends on supabaseClient.ts for DB access and uses direct Supabase calls.
- dbService.ts is an alternative wrapper that encapsulates error handling and typing.
- inquiryService.ts demonstrates a service pattern similar to what could be used for catalog operations.
- supabase_schema.sql defines the data model and security policies.

```mermaid
graph LR
App["App.tsx"] --> SC["supabaseClient.ts"]
App --> DS["dbService.ts"]
App --> IS["inquiryService.ts"]
SC --> DB["Supabase DB"]
DS --> DB
IS --> DB
Schema["supabase_schema.sql"] --> DB
```

**Diagram sources**
- [App.tsx](file://src/App.tsx)
- [supabaseClient.ts](file://src/supabase/supabaseClient.ts)
- [dbService.ts](file://src/supabase/dbService.ts)
- [inquiryService.ts](file://src/supabase/inquiryService.ts)
- [supabase_schema.sql](file://supabase_schema.sql)

**Section sources**
- [App.tsx](file://src/App.tsx)
- [supabaseClient.ts](file://src/supabase/supabaseClient.ts)
- [dbService.ts](file://src/supabase/dbService.ts)
- [inquiryService.ts](file://src/supabase/inquiryService.ts)
- [supabase_schema.sql](file://supabase_schema.sql)

## Performance Considerations
- Client-side filtering and search are memoized with useMemo to avoid unnecessary re-renders.
- For large catalogs:
  - Implement pagination or infinite scrolling to limit DOM size.
  - Add server-side filtering and indexing on frequently queried columns (e.g., category, store_name, name).
  - Use partial selects to reduce payload size.
  - Consider caching strategies (client cache or CDN for images).
  - Debounce search input to reduce frequent state updates.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Environment configuration: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.
- Common errors:
  - Missing credentials will cause client initialization warnings.
  - Network failures result in error responses handled by try/catch blocks and toast notifications.
  - RLS misconfiguration may block operations; verify policies allow intended actions.

**Section sources**
- [supabaseClient.ts](file://src/supabase/supabaseClient.ts)
- [App.tsx](file://src/App.tsx)

## Conclusion
The product catalog system provides a solid foundation for managing menu items with category-based browsing, search, and featured promotions. Extending the schema to support inventory tracking and implementing server-side optimizations will enhance scalability and user experience.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### API Reference Summary
- Create menu item: POST insert to menu_items with required fields.
- Read menu items: SELECT all or filtered by category/search.
- Update menu item: UPDATE is_featured or other fields by id.
- Delete menu item: DELETE by id (not currently exposed in UI).

**Section sources**
- [App.tsx](file://src/App.tsx)
- [supabase_schema.sql](file://supabase_schema.sql)