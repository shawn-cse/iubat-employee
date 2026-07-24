# IUBAT Employee Roster

A modern, responsive web application for browsing the employee directory of the International University of Business Agriculture and Technology (IUBAT). Built with vanilla JavaScript and Supabase for real-time data access.

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- **🔍 Live Search** – Filter employees by name, designation, or department with instant results
- **📱 Responsive Design** – Optimized for desktop, tablet, and mobile devices
- **📞 Tap-to-Call** – One-tap phone dialing on mobile devices
- **✉️ Tap-to-Email** – Quick email composition with one tap
- **📋 Copy & Share** – Copy employee details to clipboard or share via native share dialog
- **⚡ Real-time Data** – Powered by Supabase for up-to-date information
- **🎨 Clean UI** – Modern, accessible interface with smooth animations
- **♿ Accessibility** – ARIA labels and keyboard navigation support

## 🚀 Live Demo

Visit the live application: [IUBAT Employee Roster](https://shawn-cse.github.io/iubat-employee/)

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🔧 Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Supabase API access)

### Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/shawn-cse/iubat-employee.git
   cd iubat-employee
   ```

2. **Open the application**

   ```bash
   # Open index.html in your browser
   open index.html
   # Or simply double-click the file
   ```

3. **No build tools required** – This is a pure HTML/CSS/JavaScript application.

## ⚙️ Configuration

### Supabase Setup

The application uses Supabase as its backend. To configure your own instance:

1. **Create a Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project** and note your URL and anon key
3. **Create the Employee table** with the following schema:

```sql
CREATE TABLE Employee (
    id BIGSERIAL PRIMARY KEY,
    "Name" TEXT,
    "Designation" TEXT,
    "Department/Office" TEXT,
    "Room" TEXT,
    "Email" TEXT,
    "Cell" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. **Enable Row Level Security (RLS)** and create policies:

```sql
ALTER TABLE Employee ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
    ON Employee
    FOR SELECT
    TO public
    USING (true);
```

5. **Update the configuration** in `script.js`:

```javascript
// Supabase Configuration
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
const TABLE_NAME = "Employee";
```

## 📖 Usage

### Searching Employees

- Type any part of a name, designation, or department in the search bar
- Results update instantly as you type
- Clear the search with the × button
- Press Enter or click the search button for explicit search

### Viewing Employee Details

Each employee card displays:

- Full name
- Designation
- Department/Office
- Room number (if available)
- Email address (tap to email)
- Phone number (tap to call)

### Actions

- **Copy** – Copies all employee details to clipboard
- **Share** – Shares employee details via native share dialog
- **Tap Email** – Opens default email client
- **Tap Phone** – Opens phone dialer

### Request/Update

- Click the floating action button (FAB) to request updates or report errors
- Contact via email, Facebook, or WhatsApp

## 📁 Project Structure

```
iubat-employee/
├── index.html          # Main HTML structure
├── style.css           # All styles and responsive design
├── script.js           # Application logic and Supabase integration
└── README.md           # This file
```

## 🛠 Technologies Used

| Technology            | Purpose                                       |
| --------------------- | --------------------------------------------- |
| **HTML5**             | Semantic markup structure                     |
| **CSS3**              | Custom styling with CSS variables and flexbox |
| **JavaScript (ES6+)** | Application logic and DOM manipulation        |
| **Supabase**          | Backend database and API                      |
| **Google Fonts**      | Fraunces, Inter, and IBM Plex Mono fonts      |

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Guidelines

- Follow existing code style
- Test on multiple browsers
- Update documentation as needed
- Keep commits atomic and descriptive

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

## 📬 Contact

**Developer:** Shawon  
**Email:** shawn.iubat@gmail.com  
**Facebook:** [shawnazd](https://facebook.com/shawnazd)  
**WhatsApp:** +880 1873 319733  
**GitHub:** [shawn-cse](https://github.com/shawn-cse)

**Project Link:** [https://github.com/shawn-cse/iubat-employee](https://github.com/shawn-cse/iubat-employee)

---

<div align="center">
  <sub>Built with ❤️ for the IUBAT Community</sub>
</div>

## 🙏 Acknowledgments

- IUBAT administration for providing the data
- Supabase for the excellent backend service
- All contributors and users of this directory
