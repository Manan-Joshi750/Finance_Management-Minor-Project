# 💰 Finance Management Dashboard

> A modern, responsive, and full-featured expense tracking application built with **React.js** and **Tailwind CSS**.

![WhatsApp Image 2026-02-08 at 1 26 51 PM](https://github.com/user-attachments/assets/004edce4-6587-497e-b3b9-c867c2fda858)

## 📖 Project Overview
The **Finance Management Dashboard** is a comprehensive tool designed to help users track their financial health. It moves beyond simple spreadsheets by offering real-time budget logic, interactive visualizations, and advanced data handling capabilities like CSV parsing.

This project implements a complete **CRUD** (Create, Read, Update, Delete) architecture with local persistence, ensuring data remains available even after refreshing the page.

---

## ✨ Key Features

### 📊 Interactive Dashboard
- **Real-time Overview:** Instant calculation of Total Income, Total Expenses, and Current Balance.
- **Visual Analytics:** Dynamic charts displaying spending distribution by category.
- **Budget Alerts:** Intelligent logic that triggers warnings when expenses exceed available funds.

### 💸 Transaction Management
- **Add Transactions:** Detailed form with validation for Title, Amount, Category, Type (Income/Expense), and Date.
- **Transaction History:** A sortable and filterable list of all financial records.
- **Delete Capability:** Secure removal of transactions with confirmation prompts.
- **Smart Sorting:** Sort by Date, Amount, or Category instantly.

### 📂 Advanced Data Handling (New!)
- **CSV Import Engine:** Batch import legacy data or bank statements directly into the app using a custom-built parser.
- **CSV Export:** Download your entire financial history as a `.csv` file for external reporting.

### 🎨 UI/UX Design
- **Fully Responsive:** Works seamlessly on Desktop, Tablet, and Mobile.
- **Modern Styling:** Built with Tailwind CSS for a clean, professional aesthetic.
- **Interactive Elements:** Hover effects, smooth transitions, and intuitive navigation.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React.js (v18) | Component-based architecture for dynamic UI. |
| **Styling** | Tailwind CSS | Utility-first CSS framework for rapid design. |
| **Routing** | React Router DOM | Client-side routing for seamless navigation. |
| **Icons** | React Icons | Vector icons (FontAwesome/Material) for UI elements. |
| **Data Visualization** | Chart.js | Rendering interactive pie/bar charts. |
| **State Management** | React Hooks | `useState`, `useEffect`, `useMemo` for logic. |
| **Persistence** | LocalStorage API | Saving user data locally in the browser. |

---

## 📸 Screenshots

### 1. Dashboard View
![WhatsApp Image 2026-02-08 at 1 26 51 PM](https://github.com/user-attachments/assets/6c5e7e02-a319-4fa4-9665-3e3c3863e2a0)

### 2. Transaction History & Filtering
![WhatsApp Image 2026-02-08 at 1 27 23 PM](https://github.com/user-attachments/assets/3df0df8e-2c89-4a16-9a6e-6a55cd222cc1)

### 3. Add Transaction & Budget Warning
![WhatsApp Image 2026-02-08 at 1 27 08 PM](https://github.com/user-attachments/assets/7f4a33e3-23c1-44b0-b3d8-b0ba2318183a)

---

## 🚀 Installation & Setup

Follow these steps to run the project locally on your machine.

**Prerequisites:** Ensure you have Node.js installed.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    cd YOUR_REPO_NAME
    ```

2.  **Install Dependencies**
    *(Note: node_modules is excluded from the repo to save space)*
    ```bash
    npm install
    ```

3.  **Start the Development Server**
    ```bash
    npm start
    ```

4.  **Launch**
    Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 📂 Project Structure

```bash
FINANCE_MANAGEMENT
├── public/              # Static assets (Favicon, index.html)
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.js
│   │   ├── SummaryCard.js
│   │   ├── TopCategoriesChart.js
│   │   ├── TransactionForm.js
│   │   └── TransactionTable.js
│   ├── pages/           # Main Page Views
│   │   ├── AddTransaction.js
│   │   ├── Dashboard.js
│   │   └── TransactionHistory.js
│   ├── App.js           # Main Entry Point & Routing Logic
│   └── index.css        # Global Styles (Tailwind directives)
├── package.json         # Project dependencies
└── README.md            # Documentation

---

## 🔮 Future Improvements

The current version allows for local data persistence. The next phase of development focuses on scalability and cloud integration.

- **User Authentication:** Implement secure Login/Signup functionality using **Firebase Auth** or **Auth0** to support multi-user accounts.
- **Full-Stack Integration:** Connect the frontend to a **Node.js/Express** backend with a **MongoDB** database for permanent cloud storage across devices.
- **Dark Mode:** Add a theme toggle to switch between Light and Dark modes for better accessibility and user experience.
- **Mobile App:** Wrap the application using **React Native** for a native mobile experience.

---

## 👥 Contributors

A big thank you to the team that made this project possible!

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Manan-Joshi750">
        <img src="https://github.com/Manan-Joshi750.png" width="100px;" alt=""/>
        <br />
        <sub><b>Manan Joshi</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Vanshika231">
        <img src="https://github.com/Vanshika231.png" width="100px;" alt=""/>
        <br />
        <sub><b>Vanshika</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Sandeep-Singh1702">
        <img src="https://github.com/Sandeep-Singh1702.png" width="100px;" alt=""/>
        <br />
        <sub><b>Sandeep Singh</b></sub>
      </a>
    </td>
  </tr>
</table>

---

<div align="center">

### Show your support

Give a ⭐️ if this project helped you!

</div>
