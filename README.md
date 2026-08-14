Overview

SkillSync is a web-based internship and job matching system designed to connect students and employers through skill-based job recommendations.

Unlike traditional keyword-based matching, SkillSync analyzes user skills and job requirements to generate relevant job recommendations. The system provides a centralized platform for job seekers, employers, and administrators to manage the recruitment and application process.

The platform provides a centralized environment where:
Students to discover and apply for job opportunities
Employers to post job opportunities and evaluate applicants
Administrators to manage users, job postings, and system activities

Features
Job Seeker
Account registration & secure login
Profile management (skills, education, experience)
Skill-based job recommendations
Job browsing & filtering
Apply for jobs
Track application status (Pending / Accepted / Rejected)
Save jobs
Messaging system with employers
Notifications system

Employer
Create and manage company profile
Post job opportunities with required skills
Manage job listings (edit/delete)
View and evaluate applicants
Accept or reject applicants
Communicate with job seekers

Admin
Approve/reject user accounts
Moderate job postings
Manage all users (students & employers)
Monitor system activity
Handle inquiries and notifications

System Features
Skill-based matching algorithm
Role-based access control (User / Employer / Admin)
Authentication & validation
Notification system
Messaging system
Dashboard for each role
Centralized database management

Tech Stack

Frontend
HTML
CSS
JavaScript

Backend
PHP
Node.js (server.js)

Database
MySQL

Other Tools
PHPMailer (email handling)
LocalStorage (session handling)

Screenshots

Public Pages
### Homepage
![Homepage](screenshots/homepage.jpg)

### Job Listings
![Jobs](screenshots/jobs.jpg)

### FAQ Page
![FAQ](screenshots/faq.jpg)

### AI Assistant
![AI](screenshots/ai-assistant.jpg)

Authentication
### Register
![Register](screenshots/register.jpg)

### Login
![Login](screenshots/login.jpg)

### Forgot Password
![Forgot](screenshots/forgot-password.jpg)

Job Seeker
### Dashboard
![Dashboard](screenshots/user-dashboard.jpg)

### Job Recommendations
![Recommendations](screenshots/recommendations.jpg)

### My Applications
![Applications](screenshots/applications.jpg)

### Messaging
![Messaging](screenshots/messaging.jpg)

### Notifications
![Notifications](screenshots/notifications.jpg)

### Profile
![Profile](screenshots/profile.jpg)

Employer
### Employer Dashboard
![Employer](screenshots/employer-dashboard.jpg)

### Post Job
![Post Job](screenshots/post-job.jpg)

### Manage Jobs
![Manage](screenshots/manage-jobs.jpg)

### Applicants
![Applicants](screenshots/applicants.jpg)

Admin
### Admin Dashboard
![Admin](screenshots/admin-dashboard.jpg)

### User Management
![Users](screenshots/user-management.jpg)

### Job Moderation
![Jobs](screenshots/job-moderation.jpg)

## Setup Guide

### Requirements
- PHP (v7.4 or higher)
- MySQL / MariaDB
- DBeaver (or any SQL client)
- Node.js (v16+ recommended)
- npm
- Web browser (Chrome recommended)

---

### 1. Clone the Repository
```bash
git clone https://github.com/jmscrlgnt/skillsync-job-matching-system.git
cd skillsync
```

### 2. Setup Database (DBeaver)
1. Open DBeaver
2. Create a new MySQL connection
3. Run:
```sql
CREATE DATABASE skillsync;
```
4. Import the SQL file located in:
```
/database/skillsync.sql
```

### 3. Configure Environment
1. Copy:
```
.env.example → .env
```
2. Edit `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=skillsync
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Backend Server
```bash
node server.js
```

### 6. Run PHP Application
```bash
php -S localhost:8000
```

### 7. Open in Browser
```
http://localhost:8000
```

---

### Notes
- Ensure MySQL server is running before starting
- Run `server.js` for full system functionality
- Configure email settings if using PHPMailer
