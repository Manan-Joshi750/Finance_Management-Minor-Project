# 📊 FinTrack - Personal Finance Management System

FinTrack is a full-stack (MERN ecosystem) personal finance application built to help users seamlessly monitor their financial health. From checking macro budgets using the golden budgeting rule to deep-diving into granular transaction statements, FinTrack simplifies wealth management with modern UX principles and robust server-side security.

---

## 🚀 Core Features

### 🔐 Secure Authentication & Session Guarding
* **Token-Based Security:** Fully integrated JWT (JSON Web Tokens) encryption handles secure account provisioning and client verification.
* **Protected Route Boundaries:** Global navigation filters check for local authorizations, protecting inner view dashboards from unauthorized endpoints.
* **Seamless Exits:** Single-click logic clears state data tokens instantly, ensuring clean desktop and mobile application logouts.

### 📈 Interactive Analytics Dashboard
* **Macro Metric Tiles:** Instantly query cumulative statistics for Total Income, Total Expenses, and Net Balance margins.
* **Smart Month-to-Month Rollover Engine:** Automatically checks chronological transitions on a user's first login of a new month. If a net positive balance remains from the preceding month, an interactive modal triggers to help users strategically redeploy those leftover savings.
* **Dynamic 50-30-20 Budget Tracker:** Live tracking automatically measures categorical distributions against the golden rules of budgeting (50% Needs, 30% Wants, 20% Savings). Integrates directly with the rollover engine to dynamically modify base targets with extra allocated funds without artificially bloating actual income metrics.
* **Predictive Expense Forecasting Banner:** Outfitted with an automated processing layer that analyzes historical transaction records. It utilizes a 3-month moving average algorithm to project upcoming baseline expenses into a clean, modern UI dashboard banner.
* **Visual Spending Categorization:** Clean, color-coded donut graphs illustrate active resource distribution for fast overview analysis.

### 🧾 Comprehensive Transaction Log & Utilities
* **Smart Query Engine:** Search transaction logs instantly by descriptor strings, or segment entries using relational category types and specific date range guidelines.
* **Automated Toolsets:** Advanced support integrations built for handling document receipt parsing via AI Scanning alongside transactional bulk spreadsheet Import/Export workflows.

---

## 🛠️ Tech Stack Matrix

| Layer | Component | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (v18+) | State-driven user interface architecture |
| | React Router DOM | Declarative client-side routing and gatekeeping closures |
| | Tailwind CSS | Utility-first styling Engine for responsive layouts |
| | React Icons | Consistent semantic icon interfaces |
| **Backend** | Node.js & Express.js | Event-driven structural API processing environment |
| **Database** | MongoDB Atlas | Distributed cloud-hosted document database schemas |
| **Security** | JSON Web Tokens (JWT) | Stateless secure payload exchange protocols |
| | Bcrypt.js | Cryptographic hashing for local database authentication keys |

---

## 📂 Project Architecture

```text
Finance_Management-Minor-Project/
├── backend/
│   ├── models/          # Mongoose Schemas (User, Transaction, Goal)
│   ├── routes/          # Express API Endpoints (Auth, Ledger)
│   ├── middleware/      # JWT Validation Security layers
│   ├── .env             # LOCAL SEED SECRETS (Excluded from Git)
│   └── server.js        # Core API Bootstrapper script
├── src/                 # Front-End Application layers
│   ├── components/      # Reusable Layout elements (Navbar, UI Blocks)
│   ├── pages/           # View Route Panels (Dashboard, History, Login)
│   ├── App.js           # Core Router and Context Provisioning
│   └── index.js         # DOM root compilation entry point
├── .gitignore           # File shield array configurations
└── README.md            # Repository documentation index
```

---

## 💻 Environment Local Workspace Provisioning
Follow these precise sequential routines to replicate and execute this ecosystem seamlessly across varying system terminals:

### 1️⃣ Repository Cloning & Shell Entry
Open your terminal and run the following commands to copy the project to your local machine and step inside the folder:
```bash
git clone [https://github.com/Manan-Joshi750/Finance_Management-Minor-Project.git](https://github.com/Manan-Joshi750/Finance_Management-Minor-Project.git)
cd Finance_Management-Minor-Project
```

### 2️⃣ Backend Initialization & Configuration
Open an active shell window tracking the server subsystem root:

```bash
cd backend
npm install
```

Create a new file explicitly labeled .env directly within the backend/ directory path and anchor your local environmental keys inside it:

```bash
MONGO_URI=mongodb+srv://<your_username>:<your_copied_atlas_password>@cluster0.tai2ci5.mongodb.net/fintrack?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_custom_cryptographic_signing_key_string
```
⚠️ CRITICAL WARNING: Ensure that your .gitignore configuration profile contains a distinct line reading .env prior to filing any commits to eliminate structural deployment data leaks.

Fire up the active database processing engine thread:

```bash
npm run dev
```
(Or fallback to npm start if nodemon tooling distributions aren't mapped locally inside the dependencies collection).

### 3️⃣ Frontend Client Shell Deployment
Spawn a completely separate parallel shell instance running natively out of the fundamental source root:

```bash
npm install
npm start
```
The workspace automation scripts will execute initialization protocols and instantiate your default system browser viewport directed straight to your frontend development port: http://localhost:3000.

---

## 🛡️ Git & System Security Protocol
This repository complies with precise environment asset separation logic rules. Core application secrets are dynamically extracted from environment runtimes, guaranteeing zero cloud exposure vectors for underlying infrastructure layers.

**Database Whitelists:** Ensure current remote network ISP endpoints are appropriately whitelisted within the MongoDB Atlas Network Administration panel.

**Secret Management:** If an environment signature leak ever occurs within historical commit tracking points, actively drop database user references instantly inside MongoDB Atlas management consoles to revoke the access vector immediately.