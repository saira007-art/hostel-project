# Folder Structure

This project uses a modular folder structure suitable for serverless deployment on Vercel or Netlify.

```
hostel-survival-platform/
│
├── api/                        # Serverless Node.js backend functions
│   ├── auth/
│   │   ├── login.js
│   │   └── signup.js
│   ├── complaints/             # Example module implemented in this prototype
│   │   └── index.js
│   ├── items/
│   ├── laundry/
│   └── notices/
│
├── database/                   # Database related files
│   └── schema.sql              # PostgreSQL schema
│
├── docs/                       # Project documentation
│   ├── api_endpoints.md
│   └── folder_structure.md
│
├── public/                     # Frontend (HTML, CSS, JS)
│   ├── css/
│   │   └── style.css           # Global vanilla CSS styles
│   ├── js/
│   │   ├── app.js              # General frontend logic
│   │   ├── auth.js             # Authentication logic
│   │   └── complaints.js       # Notice/complaints display logic
│   ├── index.html              # Main dashboard
│   ├── login.html              # Login page
│   └── complaints.html         # Complaints page
│
├── .env.example                # Environment variables template (Neon DB connection string)
├── package.json                # Project script/dependency management
└── vercel.json                 # Vercel deployment configuration
```
