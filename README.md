<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=700&size=25&duration=2800&pause=900&color=006F3C&center=true&vCenter=true&width=850&lines=Professional+IUBAT+Employee+Directory;Smart+Search+%7C+Real-Time+Data+%7C+Employee+Profiles;Built+with+HTML%2C+CSS%2C+JavaScript+%26+Supabase" />

<br/>

<a href="https://shawn-cse.github.io/iubat-employee/">
<img src="https://img.shields.io/badge/Live%20Website-Visit%20Now-006F3C?style=for-the-badge&logo=githubpages&logoColor=white" />
</a>

<a href="https://github.com/shawn-cse/iubat-employee">
<img src="https://img.shields.io/badge/GitHub-Repository-111111?style=for-the-badge&logo=github&logoColor=white" />
</a>

<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />

<img src="https://img.shields.io/badge/Version-1.0.0-C8102E?style=for-the-badge" />

</div>


# 📌 Project Overview

**IUBAT Employee Roster** is a modern, responsive employee directory web application built for **IUBAT — International University of Business Agriculture and Technology**.

The platform provides a simple and efficient way to browse employee information with instant search, employee profiles, contact actions, and real-time data access powered by **Supabase**.

Users can quickly find employees, view details, call phone numbers, send emails, copy information, and share employee details through a clean and mobile-friendly interface.


---

# 🌐 Live Website

<div align="center">

## 🚀 [Visit IUBAT Employee Roster](https://shawn-cse.github.io/iubat-employee/)

</div>


<img width="100%" src="YOUR_SCREENSHOT_LINK_HERE" />


---

# 🌟 Key Features


<table>

<tr>

<td width="50%">

## 🔍 Smart Search System

- Real-time employee search
- Search by name
- Search by designation
- Search by department
- Instant filtering results
- Fast browsing experience

</td>


<td width="50%">

## 👤 Employee Directory

- Employee profiles
- Designation information
- Department details
- Office location
- Room number
- Email and phone information

</td>

</tr>


<tr>

<td width="50%">

## 📞 Contact Features

- Tap-to-call functionality
- Tap-to-email support
- Copy employee information
- Native sharing option
- Mobile optimized actions

</td>


<td width="50%">

## ⚡ Supabase Integration

- Real-time database access
- Cloud-powered employee data
- Secure API communication
- Scalable backend solution

</td>

</tr>


<tr>

<td width="50%">

## 📱 Responsive Design

- Desktop support
- Tablet friendly
- Mobile responsive
- Modern card layout
- Smooth animations

</td>


<td width="50%">

## ♿ Accessibility

- Semantic HTML
- ARIA support
- Keyboard navigation
- User-friendly interface

</td>

</tr>

</table>


---

# 🎨 UI & Design Highlights


<div align="center">

<img src="https://img.shields.io/badge/UI-Modern%20Dashboard-006F3C?style=for-the-badge" />

<img src="https://img.shields.io/badge/Design-Clean%20%26%20Professional-B78628?style=for-the-badge" />

<img src="https://img.shields.io/badge/Responsive-All%20Devices-C8102E?style=for-the-badge" />

<img src="https://img.shields.io/badge/Animation-Smooth%20Experience-333333?style=for-the-badge" />

</div>


| Section | Design Purpose |
|---|---|
| Green Theme | University professional identity |
| Gold Accent | Highlight elements |
| Employee Cards | Organized information display |
| Responsive Layout | Multi-device support |
| Smooth Animation | Better user experience |


---

# 🏛 Application Structure


```text
IUBAT Employee Roster

│
├── Employee Dashboard
│
├── Live Search Engine
│
├── Employee Profile Cards
│
├── Contact Management
│   ├── Email
│   ├── Phone Call
│   ├── Copy
│   └── Share
│
├── Supabase Database
│
└── Responsive Interface

```


---

# 🛠 Tech Stack


<div align="center">

<img src="https://img.shields.io/badge/HTML5-Structure-E34F26?style=for-the-badge&logo=html5&logoColor=white" />

<img src="https://img.shields.io/badge/CSS3-Styling-1572B6?style=for-the-badge&logo=css3&logoColor=white" />

<img src="https://img.shields.io/badge/JavaScript-Logic-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111" />

<img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />

<img src="https://img.shields.io/badge/GitHub-Pages-181717?style=for-the-badge&logo=github&logoColor=white" />

</div>


---

# 📁 Project Structure


```text
iubat-employee/

│
├── index.html
│
├── style.css
│
├── script.js
│
└── README.md

```


---

# ⚙️ Installation & Setup


Clone repository:

```bash
git clone https://github.com/shawn-cse/iubat-employee.git
```


Open project folder:

```bash
cd iubat-employee
```


Run the project:

```text
Open index.html in your browser
```


No framework or build tool required.


---

# 🔧 Supabase Configuration


This project uses Supabase for employee data management.


Create an Employee table:


```sql
CREATE TABLE Employee (
    id BIGSERIAL PRIMARY KEY,
    "Name" TEXT,
    "Designation" TEXT,
    "Department/Office" TEXT,
    "Room" TEXT,
    "Email" TEXT,
    "Cell" TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```


Enable public read access:


```sql
ALTER TABLE Employee ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON Employee
FOR SELECT
TO public
USING (true);
```


Add Supabase credentials inside:

```javascript
script.js
```


---

# 📖 Usage


### Search Employees

Users can search employees by:

- Name
- Designation
- Department


### Employee Actions

Available actions:

✅ Copy details  
✅ Share information  
✅ Send email  
✅ Make phone calls  


---

# 🚀 Deployment


Deployment platform:

```
GitHub Pages
```


Steps:

```
Repository Settings
        ↓
Pages
        ↓
Deploy from main branch
        ↓
Save
```


---

# 🔮 Future Improvements


- Admin dashboard
- Employee update requests
- Authentication system
- Advanced filtering
- Employee profile pages
- Dark mode
- Department analytics
- QR profile sharing
- Mobile application


---

# 👨‍💻 Developer


<div align="center">


## Developed by **Shawn**


<a href="https://github.com/shawn-cse">

<img src="https://img.shields.io/badge/GitHub-shawn--cse-181717?style=for-the-badge&logo=github" />

</a>


<a href="mailto:shawn.iubat@gmail.com">

<img src="https://img.shields.io/badge/Email-shawn.iubat@gmail.com-EA4335?style=for-the-badge&logo=gmail" />

</a>


</div>


---

# ⭐ Support


If this project is useful for the IUBAT community, consider giving it a ⭐ on GitHub.


<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:C8102E,40:B78628,100:006F3C&height=130&section=footer" />

</div>
