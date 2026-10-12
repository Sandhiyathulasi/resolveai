# SmartResolve AI – Student Complaint Management System

> **A modern, responsive, and beginner-friendly web application designed for college campuses to triage student complaints, automate urgency analysis, and streamline administrative resolutions.**

---

## 📌 Project Overview

**SmartResolve AI** provides an intuitive self-service portal for college students to report infrastructure, utility, and maintenance issues, while giving campus administrators a centralized control desk to monitor, triage, and resolve complaints.

The application includes an **Explainable AI Triage Engine** that processes natural language grievance descriptions, automatically predicts the facility category (Water, Electricity, Wi-Fi, Cleanliness, Maintenance), assesses urgency level (Low, Medium, High), generates an administrative summary, and recommends an immediate resolution action.

---

## 🚀 Key Features

### 1. 📊 Home Dashboard
- **Dynamic KPI Stat Cards**: Real-time counter of Total Complaints, Pending Review, In Progress, and Resolved cases with calculated resolution rates.
- **Category Distribution Breakdown**: Visual counter showing volume across Water, Electricity, Wi-Fi, Cleanliness, and Maintenance.
- **Recent Complaints List**: Quick-glance list of recent submissions with status pills, priority tags, and 1-click status tracking.

### 2. ✍️ Student Complaint Form
- **Input Fields**: Full Name, Roll Number/ID, Campus Email, Location (Hostel/Lab/Classroom), Category mode, Title, and Detailed Description.
- **Client-Side Form Validation**: Checks for required inputs and valid campus email format.
- **Live AI Triage Preview**: As students type their issue, the AI engine dynamically predicts the category, urgency, department, and recommended action in real-time.
- **Unique Ticket Generation**: Automatically generates collision-resistant ticket IDs (e.g. `CMP-2026-1007`).
- **Instant Confirmation Modal**: Features one-click "Copy ID" to clipboard and direct navigation to status tracking.

### 3. 🤖 AI Complaint Analysis Engine
- **Transparent Rule-Based NLP**: Categorizes complaints into:
  - 💧 **Water**: Plumbing, leaks, washroom, taps, overflows, coolers.
  - ⚡ **Electricity**: Power cuts, sparks, short circuits, switchboards, flickering lights.
  - 📶 **Wi-Fi**: Connectivity, access points, latency, captive portal login loops.
  - 🧹 **Cleanliness**: Waste disposal, overflowing bins, pests, sanitization, odor.
  - 🔨 **Maintenance**: Broken furniture, benches, doors, locks, elevators, windows.
  - 📋 **Other**: General administrative issues.
- **Urgency Scoring**:
  - **High Priority**: Detects safety threats and emergency keywords (*hazard, spark, electric shock, flood, fire, burst pipe*).
  - **Medium Priority**: Detects operational disruptions (*not working, exam tomorrow, foul odor, frequent drops*).
  - **Low Priority**: Routine maintenance or cosmetic concerns.
- **Administrative Action Recommendations**: Generates tailored operational advice for facilities managers (e.g. "Cut off local circuit breaker", "Shut isolation valve", "Reboot AP AP-LIB-02").

### 4. 🔍 Complaint Tracking & Stepper
- **Search by ID**: Search any ticket (e.g. `CMP-2026-1001`) to view full grievance history.
- **3-Step Progress Stepper**:
  1. *Submitted* (Timestamped)
  2. *In Progress / Under Review* (Work order issued)
  3. *Resolved* (Repairs completed & verified)
- **Detailed Audit Trail**: Displays student submission details, full description, AI reasoning breakdown, and official administrator remarks.

### 5. 🛡️ Admin Management Desk
- **Full Complaints Table**: View all submitted tickets with sorting and search capabilities.
- **Multi-Criteria Filter Bar**: Filter simultaneously by Search query, Workflow Status, Category, Priority, and Date/Priority Sorting.
- **Status & Remarks Updater**: Administrators can transition tickets between *Pending*, *In Progress*, and *Resolved*, and attach public resolution notes.
- **Data Export**: Export all records to a portable JSON backup file.

### 6. 🧪 Demonstration Data Controls
- **One-Click Sample Data**: Load 6 realistic campus complaints covering electrical hazards, Wi-Fi outages, plumbing leaks, and classroom maintenance.
- **Clear Data Option**: Reset `localStorage` safely at any time.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Markup** | Semantic HTML5 (Single Page Architecture, Accessible ARIA standards) |
| **Styling** | Modern CSS3 (Custom Properties, Flexbox & CSS Grid, Responsive Design, Blue-and-White Theme) |
| **Scripting** | Vanilla JavaScript (ES6+ modular closures, Asynchronous API design) |
| **Storage** | HTML5 `localStorage` (Zero database installation required) |
| **Icons** | Lightweight, inline SVG icons (Zero external font dependencies) |

---

## 📁 File Structure

```text
smartresolve-ai/
│
├── index.html              # Main single-page application entry point
│
├── css/
│   └── styles.css          # Responsive styling, college theme, and animations
│
├── js/
│   ├── aiAnalysis.js       # Rule-based NLP classifier & priority engine
│   ├── storage.js          # LocalStorage CRUD manager & demo dataset
│   └── app.js              # Application controller, tab router, & UI logic
│
└── README.md               # Project documentation and architectural guide
```

---

## 📖 How to Run the Application Locally

The project requires **no build tools, no Node.js dependencies, and no npm installs**.

### Method 1: Double-Click (Direct Browser Opening)
1. Navigate to the folder:
   ```text
   C:\Users\ELCOT\.gemini\antigravity\scratch\smartresolve-ai
   ```
2. Double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### Method 2: Using Python's Built-in HTTP Server (Optional)
If you prefer running through a local web server:
1. Open PowerShell or Terminal in the project directory:
   ```bash
   cd "C:\Users\ELCOT\.gemini\antigravity\scratch\smartresolve-ai"
   python -m http.server 8000
   ```
2. Open your web browser and visit:
   ```
   http://localhost:8000
   ```

### Method 3: VS Code "Live Server" Extension
1. Open the folder in Visual Studio Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

---

## 🧠 AI Architecture: Simulated vs. Real AI Disclosure

> **Transparency Statement**:  
> In adherence to academic integrity and trustworthy AI principles, this application clearly discloses that the initial demonstration uses **deterministic Rule-Based Natural Language Processing (NLP)** heuristics and dictionary scoring. It does **not** make paid calls to third-party cloud LLM APIs.

### Feature Comparison

| Capability | Initial Version (Current) | Production LLM Upgrade (Future) |
| :--- | :--- | :--- |
| **Classification** | Keyword matching across facilities dictionaries | Multi-class zero-shot text classification |
| **Urgency Detection** | Safety & hazard heuristic rule triggers | Sentiment & context-aware semantic reasoning |
| **Summarization** | Deterministic structured text templating | Generative abstractive summarization |
| **Cost & Latency** | 100% Free, Instant (< 50ms) | Token fees, Network API latency (~1–2s) |
| **Privacy & Security** | Data stays entirely in the student's browser | Encrypted server-to-server API communication |

### Upgrading to a Production LLM Backend

The code is architected using the **Adapter Pattern** in `js/aiAnalysis.js`. The public method `SmartResolveAI.analyzeComplaint()` is already written as an `async` function.

To connect a production AI model (e.g., Google Gemini 1.5, Anthropic Claude, or OpenAI GPT-4o), you only need to modify one function to point to your secure backend proxy:

```javascript
// js/aiAnalysis.js (Production Backend Adapter)
async function analyzeComplaint({ title, description, location, manualCategory }) {
  const response = await fetch('https://api.yourcollege.edu/complaints/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, location, manualCategory })
  });
  
  if (!response.ok) throw new Error('AI backend triage failed');
  return await response.json();
}
```

> ⚠️ **Security Notice**: Never put LLM API keys directly into frontend JavaScript files (`app.js` or `index.html`). Always route requests through a secured backend server (such as Python FastAPI, Flask, or Node.js Express) where secrets are stored in protected environment variables.

---

## 🔒 Privacy & Data Safety

- **Zero Third-Party Tracking**: No telemetry, tracking pixels, or third-party analytical scripts are included.
- **Safe Demonstration Data**: All pre-populated sample complaints utilize synthetic, fictional student names and demo campus scenarios.
- **Client-Side Sandbox**: All actions are isolated to your local browser environment.

---

## 🧪 Testing Checklist

- [x] Home Dashboard statistics calculate automatically from storage.
- [x] Complaint Form validates required inputs and campus email formats.
- [x] Real-time AI preview responds dynamically as the user types descriptions.
- [x] Unique Complaint ID is generated and modal allows one-click copy.
- [x] Complaint Tracking stepper accurately highlights "Submitted", "In Progress", and "Resolved" phases.
- [x] Admin Portal filters by search keyword, category, status, and priority simultaneously.
- [x] Admin status update persists remarks and updates global dashboard KPIs.
- [x] "Load Sample Complaints" and "Clear Data" buttons operate cleanly without errors.
