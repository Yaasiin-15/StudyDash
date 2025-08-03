# StudyDash - Student Productivity Dashboard

A comprehensive student productivity dashboard built with React, designed to help students track assignments, habits, grades, and academic progress with an engaging gamified experience.

![StudyDash](https://imagedelivery.net/FIZL8110j4px64kO6qJxWA/b096d1f2j0d89j4390jbce5j1c4861035a11/public)

## 🚀 Features

### 📊 **Dashboard & Analytics**
- **Personal Dashboard**: Overview of tasks, assignments, and progress
- **Subject Analytics**: Detailed performance tracking by subject
- **Progress Charts**: Visual representation of academic progress
- **XP & Leveling System**: Gamified experience with rewards

### 📚 **Study Management**
- **Study Planner**: Create and manage study sessions
- **Study Manager**: Organize study materials and resources
- **Study Assignments**: Track assignment progress and deadlines
- **Pomodoro Timer**: Focus timer with session tracking
- **Reading List**: Manage books and reading materials

### ✅ **Task & Goal Management**
- **Todo List**: Simple task management
- **Habits & Goals**: Track daily habits and long-term goals
- **Calendar Integration**: Visual calendar with events
- **Assignment Tracking**: Manage coursework and deadlines

### 📈 **Academic Tracking**
- **Grade Tracker**: Record and analyze grades
- **Subject Analytics**: Performance insights by subject
- **Progress Monitoring**: Visual progress indicators
- **Recommendations**: AI-powered study suggestions

### 💰 **Financial Management**
- **Finance Tracker**: Monitor educational expenses
- **Wishlist**: Track desired purchases
- **Budget Planning**: Educational budget management

### 📝 **Personal Development**
- **Journal**: Personal reflection and note-taking
- **User Profile**: Personal information management
- **Settings**: Customize your experience
- **Dark Mode**: Toggle between light and dark themes

## 🛠️ Technology Stack

- **Frontend**: React 18.2.0
- **Routing**: React Router DOM 6.11.2
- **Styling**: Tailwind CSS 3.3.2
- **Charts**: Chart.js 4.3.0 + React Chart.js 2
- **Icons**: Lucide React 0.244.0
- **Date Handling**: date-fns 2.30.0
- **Build Tool**: Vite 4.3.9
- **Confetti**: canvas-confetti 1.6.0

## 📦 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studydash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChartContainer.jsx
│   ├── LevelUpModal.jsx
│   ├── ProtectedRoute.jsx
│   ├── Sidebar.jsx
│   ├── StatCard.jsx
│   └── charts/
│       ├── AssignmentChart.jsx
│       └── XPChart.jsx
├── context/            # React Context providers
│   ├── AppContext.jsx  # Main app state management
│   └── AuthContext.jsx # Authentication state
├── pages/              # Application pages
│   ├── Dashboard.jsx
│   ├── StudyManager.jsx
│   ├── PomodoroTimer.jsx
│   ├── TodoList.jsx
│   ├── Calendar.jsx
│   ├── HabitsGoals.jsx
│   ├── Resources.jsx
│   ├── Grades.jsx
│   ├── Wishlist.jsx
│   ├── ReadingList.jsx
│   ├── Journal.jsx
│   ├── SubjectAnalytics.jsx
│   ├── Recommendations.jsx
│   ├── UserProfile.jsx
│   ├── Assignments.jsx
│   ├── FinanceTracker.jsx
│   ├── Goals.jsx
│   ├── Habits.jsx
│   ├── StudyAssignments.jsx
│   ├── StudyPlanner.jsx
│   ├── Settings.jsx
│   └── Login.jsx
├── utils/              # Utility functions
│   ├── confetti.js
│   └── userDataManager.js
├── assets/             # Static assets
│   └── favicon.svg
├── App.jsx             # Main app component
├── main.jsx           # Application entry point
└── index.css          # Global styles
```

## 🎯 Key Features Explained

### Authentication System
- User registration and login
- Persistent session management
- User-specific data storage

### Gamification
- XP (Experience Points) system
- Level progression
- Achievement tracking
- Confetti celebrations for milestones

### Data Management
- Local storage for user data
- User-specific data isolation
- Automatic data persistence
- Cross-device data sync (local storage)

### Responsive Design
- Mobile-first approach
- Dark/Light theme support
- Responsive sidebar navigation
- Touch-friendly interface

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface
- **Dark Mode**: Toggle between light and dark themes
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessible**: Keyboard navigation and screen reader support
- **Smooth Animations**: Enhanced user experience

## 📊 Data Visualization

- **Chart.js Integration**: Beautiful charts and graphs
- **Progress Tracking**: Visual progress indicators
- **Analytics Dashboard**: Comprehensive data insights
- **Performance Metrics**: Detailed academic analytics

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_APP_TITLE=StudyDash
VITE_APP_DESCRIPTION=Student Productivity Dashboard
```

### Tailwind Configuration
The project uses Tailwind CSS with custom configuration in `tailwind.config.js`.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Charts powered by [Chart.js](https://www.chartjs.org/)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/studydash/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🔮 Future Enhancements

- [ ] Cloud synchronization
- [ ] Mobile app version
- [ ] Advanced analytics
- [ ] Social features
- [ ] Integration with learning management systems
- [ ] AI-powered study recommendations
- [ ] Export/import functionality
- [ ] Multi-language support

---

**Built with ❤️ for students everywhere**

*StudyDash - Your Personal Academic Success Companion* 