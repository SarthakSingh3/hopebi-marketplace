# HOPEBI — Curated Indian B2C Marketplace
> **Empowering Underexposed Indian Manufacturers & Emerging Brands to Sell Directly to Indian Consumers.**

---

## 1. Executive Summary & Vision

Many Indian manufacturers excel at craftsmanship, industrial manufacturing, and quality production—ranging from brassware in Moradabad and pure kansa bronze in Gujarat to Nilgiri artisanal orthodox teas and Kashmir handweavers. Traditionally, these businesses have been confined to B2B wholesale networks, regional exhibitions, or export traders, remaining invisible to ordinary Indian retail consumers.

**HOPEBI** is a modern, full-stack, direct-to-consumer (B2C) e-commerce marketplace built specifically to solve this problem. It bridges carefully vetted Indian manufacturers with conscious retail consumers across India through an elegant, trustworthy, and transparent digital storefront.

---

## 2. Core Architecture & Tech Stack

HOPEBI is built as a robust, production-grade **modular monolith** adhering strictly to enterprise software engineering standards.

```
       [ Customer / Seller / Admin Browser ]
                         |
           (Vite + React 18 + TypeScript)
           (Tailwind CSS v4 + Lucide Icons)
                         |
           REST API / JSON via Spring Security
                         |
      [ Spring Boot 3.3.4 (Java 21 LTS) Backend ]
   +-------------------------------------------------+
   | Controller Layer (REST Endpoints & Validation)   |
   | Service Layer (Business Rules & Calculations)   |
   | Security Filter (JWT Token Verification & RBAC) |
   | Repository Layer (Spring Data JPA / Hibernate)  |
   +-------------------------------------------------+
                         |
     [ Database: H2 (Dev) / PostgreSQL 16 (Prod) ]
             (Managed by Flyway Migrations)
```

### 2.1 Backend
- **Language & Runtime:** Java 21 LTS
- **Framework:** Spring Boot 3.3.4
- **Security:** Spring Security 6 with stateless JWT Bearer token authentication & role-based access control (RBAC).
- **Persistence:** Spring Data JPA + Hibernate ORM.
- **Database Migrations:** Flyway (DDL script `V1__init_schema.sql`).
- **Database Support:** Zero-friction H2 database in PostgreSQL-compatibility mode for local setup out of the box, with full native PostgreSQL 16 support via Docker Compose (`application-postgres.yml`).
- **API Documentation:** OpenAPI 3 / Swagger (`/swagger-ui.html`).
- **Testing:** JUnit 5, Mockito, Spring Boot Test.

### 2.2 Frontend
- **Framework:** React 18 with Vite.
- **Language:** TypeScript (strict mode, zero type errors).
- **Styling:** Tailwind CSS v4 with modern `@tailwindcss/vite` integration.
- **State & Context:** React Context API (`AuthContext`, `CartContext`) with guest cart session persistence and automatic post-login cart merging.
- **Icons:** Lucide React.
- **Client Routing:** React Router v6 with route protection (`ProtectedRoute`, `SellerRoute`, `AdminRoute`).

---

## 3. Key Business Rules & Architectural Features

1. **Server-Authoritative Pricing & Stock:**
   - The frontend never dictates prices or discounts. All subtotal, taxes, shipping, commission, and total calculations occur authoritatively on the Spring Boot backend.
   - Atomic inventory verification: Stock is verified and decremented in a single transaction during checkout, preventing overselling.

2. **Configurable Dynamic Commission Model:**
   - Platform commission defaults to **5.0%**, but is never hardcoded. It is dynamically resolved from `app.marketplace.default-commission-rate` and persisted per order item (`platformFeeRate` and `platformFeeAmount`).
   - Admins can adjust platform settings at runtime.

3. **Multi-Seller Order Splitting:**
   - When a consumer orders items from multiple manufacturers in one cart, the backend automatically groups items under seller-specific fulfilment packages.
   - Each manufacturer views and updates fulfillment (Pending -> Processing -> Shipped with tracking number -> Delivered) solely for their own items.

4. **Authentic Indian Localization:**
   - Currency: Indian Rupee (`₹` / `INR`) formatted using Indian numbering standards (`₹1,499.00`).
   - Phone Numbers: 10-digit Indian mobile validation (`^[6-9]\d{9}$`).
   - Postal Addresses: 6-digit PIN code validation (`^\d{6}$`) with Indian states dropdown.

5. **Verified Purchase Reviews Only:**
   - Customers can only review products that they have successfully purchased and had delivered, preventing review manipulation.

6. **1-Click Founder Demo Role Switcher:**
   - A prominent, discreet switcher in the top navigation bar enables instructors, recruiters, and investors to switch instantly between **Customer**, **Seller**, and **Admin** accounts with a single click.

7. **Direct Device Media Uploads for Manufacturers:**
   - Sellers can upload high-resolution product photography directly from their phones or computers (JPEG, PNG, WebP up to 10MB) via `POST /api/v1/uploads/image`.
   - Files are validated, assigned cryptographic UUID identifiers, safely persisted in the server storage, and served statically via the `/uploads/**` resource mapping.

8. **Site-Grounded AI Shopping Assistant:**
   - An interactive conversational AI concierge accessible via floating chat on the frontend or `POST /api/v1/assistant/chat`.
   - Strictly grounded *only to HOPEBI* (craft heritage knowledge, Ayurvedic material science, live product and manufacturer retrieval, order tracking, and store policies).
   - Enforces automated boundary guardrails that gracefully decline off-topic queries.

---

## 4. Local Setup & Quick Start Guide

### Prerequisites
- **Java 21 LTS** installed (`java -version`).
- **Node.js 18+** and **npm** installed (`node -v`, `npm -v`).
- *(Optional)* **Docker & Docker Compose** if running native PostgreSQL instead of the embedded engine.

---

### Step 1: Run the Backend

The project includes an embedded Maven wrapper (`mvnw.cmd` on Windows, `./mvnw` on Unix).

```bash
# Navigate to the backend directory
cd backend

# Run the Spring Boot application (uses zero-friction H2 with auto-migration by default)
.\mvnw.cmd spring-boot:run
```

*The backend will start at `http://localhost:8080`. Flyway will automatically run database migrations and `DataInitializer` will seed 10 manufacturers, 7 categories, 13 products, and test accounts.*

- **Swagger UI / API Docs:** `http://localhost:8080/swagger-ui/index.html`
- **H2 Web Console:** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/hopebidb`, User: `sa`, Password: empty)

#### Running with PostgreSQL 16 (Optional)
If you prefer running against a real PostgreSQL container:
```bash
# In the project root, start PostgreSQL
docker-compose up -d

# Start backend with the postgres profile
cd backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=postgres
```

---

### Step 2: Run the Frontend

```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start Vite development server
npm run dev
```

*The frontend will start at `http://localhost:5173`. The Vite proxy is pre-configured to route all `/api/*` calls directly to `http://localhost:8080`.*

---

## 5. Pre-Seeded Demo Accounts & Data

The database is pre-seeded with realistic Indian manufacturer data. You can log in manually or use the **1-Click Demo Switcher** in the top navigation:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hopebi.com` | `AdminPassword123!` | Platform Superadmin (Seller approvals, platform metrics, catalog audit) |
| **Seller** | `seller@hopebi.com` | `SellerPassword123!` | Maker: Moradabad Metalcrafts (Product management, fulfillment tracking) |
| **Customer** | `customer@hopebi.com` | `CustomerPassword123!` | Buyer: Ananya Iyer (Saved Bengaluru address, past order history) |

### Test Promotion Coupon
- Code: **`HOPEBI50`**
- Benefit: Flat **₹50 off** on orders of ₹500 or more.

### 10 Pre-Seeded Regional Indian Manufacturers
1. **Moradabad Metalcrafts** *(Uttar Pradesh)* — Traditional Hand-Etched Brass Urli & Planters
2. **Kutch Kansa Crafts** *(Gujarat)* — 78:22 Pure Bell Metal Ayurvedic Dinnerware
3. **Nilgiri Cloud Artisanal Teas** *(Tamil Nadu)* — High-Grown Single-Estate Whole Leaf Teas
4. **Kashmir Pashmina & Silk Guild** *(Jammu & Kashmir)* — Handwoven Pashmina Shawls with GI Authentication
5. **Channapatna Heritage Woodcraft** *(Karnataka)* — Non-toxic Vegetable-Dyed Ivory Wood Toys
6. **Khurja Ceramic Studios** *(Uttar Pradesh)* — Hand-painted Stoneware Dinner Sets
7. **Malabar Spice Harvesters** *(Kerala)* — Tellicherry Garbled Extra Bold Black Pepper & Spices
8. **Kolhapuri Heritage Footwear** *(Maharashtra)* — Hand-braided Vegetable-Tanned Leather Footwear
9. **Jaipur Blue Pottery Collective** *(Rajasthan)* — Traditional Quartz-Glazed Decorative Bowls
10. **Dharwad Naturals** *(Karnataka)* — Cold-Pressed Organic Sesame & Groundnut Oils

---

## 6. Running Automated Tests

### Backend Unit & Integration Tests
```bash
cd backend
.\mvnw.cmd test
```
*Executes unit tests for pricing, inventory checks, discount calculations, cart totals, and Spring Security integration tests with mock MVC.*

### Frontend Production Build Test
```bash
cd frontend
npm run build
```
*Executes TypeScript verification (`tsc -b`) and Vite production bundling.*

---

## 7. Architecture & Computer Science Interview Companion
*(For B.Tech CSE Final-Year Placements & System Design Interviews)*

### Q1: Why use DTOs (Data Transfer Objects) instead of returning JPA Entities directly?
1. **Security / Over-posting:** Entities contain sensitive internal fields (e.g. `passwordHash`, internal audit flags). Returning entities directly can accidentally leak sensitive data or allow clients to overwrite unauthorized fields during deserialization.
2. **Circular References:** Bidirectional JPA relationships (e.g. `@OneToMany` between `Order` and `OrderItem`) cause infinite recursion during Jackson JSON serialization (`StackOverflowError`).
3. **Decoupling API Contracts:** The database schema can evolve independently from the external REST API without breaking mobile apps or frontend clients.

### Q2: How does HOPEBI handle concurrent checkouts for limited inventory?
- At the service layer (`OrderService`), product stock is validated inside an `@Transactional` boundary.
- For high-concurrency enterprise scale, inventory is protected using **Pessimistic Locking** (`SELECT ... FOR UPDATE` via `@Lock(LockModeType.PESSIMISTIC_WRITE)`) or **Optimistic Locking** (`@Version` column). If stock drops below requested quantity, the transaction rolls back cleanly with a `BadRequestException("Insufficient stock")`.

### Q3: How does JWT Stateless Authentication work in Spring Security 6?
1. The client sends credentials (`/api/v1/auth/login`).
2. `AuthenticationManager` verifies the BCrypt hashed password against the database.
3. Upon success, `JwtTokenProvider` signs a cryptographic JWT token containing claims (`sub`, `roles`, `exp`) using HMAC-SHA256 (`HS256`).
4. Subsequent requests pass the token in the `Authorization: Bearer <token>` header.
5. `JwtAuthenticationFilter` intercepts requests before reaching the controller, validates the token signature, extracts user claims, and loads `UsernamePasswordAuthenticationToken` into the `SecurityContextHolder`.

### Q4: Why use Flyway instead of Hibernate `ddl-auto: update`?
- `hibernate.hbm2ddl.auto=update` is dangerous in production: it can alter tables unpredictably, fails to delete obsolete columns, cannot handle complex data transformations, and is non-reproducible across distributed environments.
- **Flyway** provides deterministic, version-controlled SQL scripts (`V1__...`, `V2__...`). Every migration is checksummed and logged in `flyway_schema_history`, guaranteeing exact parity across local dev, CI/CD pipelines, staging, and production.

---

## 8. License & Acknowledgements
Built for modern Indian e-commerce, showcasing regional manufacturing excellence.
Developed with clean architecture, enterprise Java, and modern React.
