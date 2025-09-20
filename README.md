# Patient Task Tracker - Frontend

A modern React frontend for the Patient Task Tracker application, designed for healthcare professionals to efficiently manage patient tasks and medical record logging.

##  Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Patient Task Tracker backend API running

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd patient-tracker-frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts
```bash
npm start            # Start development server (port 3001)
npm run build        # Create production build
npm test             # Run test suite
npm run eject        # Eject from Create React App
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication forms and logic
│   ├── dashboard/      # Main dashboard components
│   ├── patients/       # Patient list and management
│   ├── tasks/          # Task logging and display
│   └── ui/             # Basic UI components (buttons, inputs)
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Authentication state management
│   └── useApi.js       # API interaction hooks
├── services/           # API service layer
│   └── api.js          # Axios configuration and endpoints
├── styles/             # CSS and styling
├── utils/              # Helper functions
└── App.js              # Main application component
```

##  Design System

### Healthcare-Focused Color Palette
```scss
// Primary Healthcare Colors
$colors: (
  medical-blue: #2563eb,      // Trust and professionalism
  success-green: #10b981,     // Completed tasks, vital signs in range
  warning-amber: #f59e0b,     // Attention needed, overdue tasks
  critical-red: #ef4444,      // Critical alerts, urgent tasks
  neutral-gray: #6b7280       // Secondary information
);

// Task Type Color Coding
$task-colors: (
  medication: #8b5cf6,        // Purple for medications
  vitals: #06b6d4,           // Cyan for vital signs
  assessment: #10b981,        // Green for assessments
  treatment: #f59e0b,         // Amber for treatments
  discharge: #6b7280          // Gray for discharge tasks
);
```

### Typography for Medical Context
```scss
// Medical Record Typography
$typography: (
  patient-id: (font-size: 0.875rem, font-weight: 600, letter-spacing: 0.05em),
  task-title: (font-size: 0.875rem, font-weight: 500),
  timestamp: (font-size: 0.75rem, color: #6b7280),
  clinician-name: (font-size: 0.75rem, font-weight: 500)
);
```

### Spacing for Clinical Workflows
- **8px base unit** for consistent spacing
- **Dense layouts** for data-heavy tables
- **Adequate touch targets** (44px minimum) for mobile use
- **Breathing room** around critical information

##  Key Features & Components

### Authentication System
- **Role-based login** (Clinician/Admin)
- **JWT token management** with automatic refresh
- **Secure route protection** for authenticated users
- **Session persistence** across browser refreshes

### Patient Dashboard
- **Patient list view** with medical record numbers
- **Room assignment display** for location tracking
- **Quick patient search** and filtering capabilities
- **Real-time patient count** and status indicators

### Task Logging Interface
- **Color-coded task types** for quick visual scanning:
  - 🟣 **Medication** - Purple badges
  - 🔵 **Vitals** - Blue badges  
  - 🟢 **Assessment** - Green badges
  - 🟡 **Treatment** - Amber badges
- **Timestamp formatting** for clinical accuracy
- **Clinician attribution** for accountability
- **Task completion status** with visual indicators

### Medical Record Components
```jsx
// Patient Card Component
<PatientCard>
  <MedicalRecordNumber>MRN-12345</MedicalRecordNumber>
  <PatientName>John Doe</PatientName>
  <RoomAssignment>Room 203A</RoomAssignment>
  <TaskCount>3 pending tasks</TaskCount>
</PatientCard>

// Task Log Entry
<TaskLogEntry>
  <TaskTypeBadge type="medication" />
  <TaskDescription>Administered insulin 10 units</TaskDescription>
  <Timestamp>09:15 AM - Dr. Smith</Timestamp>
  <CompletionStatus>Completed</CompletionStatus>
</TaskLogEntry>
```

##  Responsive Design for Healthcare

### Mobile-First for Clinical Mobility
- **Tablet optimization** for nurses on rounds
- **Mobile accessibility** for quick task updates
- **Touch-friendly interfaces** for gloved hands
- **Offline capability** for areas with poor connectivity

### Breakpoint Strategy
```scss
$medical-breakpoints: (
  mobile: 640px,     // Smartphones for quick checks
  tablet: 768px,     // Tablets for bedside use
  desktop: 1024px,   // Workstation computers
  large: 1280px      // Multiple monitor setups
);
```

### Layout Adaptations
- **Collapsible navigation** for tablet use
- **Stacked cards** on mobile devices
- **Horizontal scrolling tables** for comprehensive data
- **Priority-based content hiding** on smaller screens

##  Clinical User Experience

### Medical Workflow Optimization
- **Minimal clicks** to complete common tasks
- **Keyboard shortcuts** for power users
- **Bulk actions** for efficiency
- **Quick filters** by task type, time, clinician

### Accessibility for Healthcare
- **High contrast mode** for various lighting conditions
- **Screen reader compatibility** for visually impaired staff
- **Keyboard navigation** for hands-free operation
- **Font scaling** for different visual needs

### Error Handling & Feedback
- **Clear error messages** in medical context
- **Success confirmations** for completed tasks
- **Loading states** during API calls
- **Offline indicators** when connection is lost

##  Security & Privacy (HIPAA Considerations)

### Frontend Security Measures
- **No PHI in localStorage** - sensitive data stays in memory
- **Automatic session timeout** after inactivity
- **Secure token handling** with httpOnly consideration
- **XSS prevention** through React's built-in protections

### Data Handling
- **Minimal data caching** to reduce exposure
- **Immediate logout** on window close
- **No debugging info** in production builds
- **Audit trail preservation** for compliance

## 🌙 Theme Support

### Light/Dark Mode for Different Shifts
```scss
// Light theme (day shift)
.light-theme {
  --background: #ffffff;
  --surface: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
}

// Dark theme (night shift)
.dark-theme {
  --background: #111827;
  --surface: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
}
```

## 🔧 API Integration

### Backend Connection
- **Base URL**: `http://localhost:3000/api` (development)
- **Authentication**: JWT Bearer tokens
- **Request/Response**: JSON format
- **Error handling**: Standardized error responses

### API Endpoints Used
```javascript
// Authentication
POST /api/auth/register
POST /api/auth/login

// Patients
GET /api/patients
POST /api/patients
GET /api/patients/:id

// Task Logs
GET /api/task-logs
POST /api/task-logs
GET /api/task-logs/patient/:patientId
```

### API Service Layer
```javascript
// Centralized API configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic token attachment
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

##  Testing Strategy

### Component Testing
- **React Testing Library** for component behavior
- **Jest** for unit tests and mocking
- **User interaction testing** for clinical workflows
- **Accessibility testing** with jest-axe

### Integration Testing
- **API integration tests** with mock backend
- **Authentication flow testing**
- **Error scenario testing**
- **Cross-browser compatibility**

##  Deployment & Environment

### Environment Configuration
```bash
# Development
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development

# Production (example)
REACT_APP_API_URL=https://api.patienttracker.com/api
REACT_APP_ENV=production
```


---

**Frontend Version**: 1.0.0
**Compatible with Backend**: v1.0.0
**React Version**: 18.x
**Last Updated**: September 2025