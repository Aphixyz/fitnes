# FitTrack - Fitness Center Management System

FitTrack is a comprehensive fitness and nutrition tracking system built with Next.js 15, designed specifically for fitness centers. It enables trainers to manage clients, create customized workout and nutrition plans, and track progress while engaging members through gamification features.

## 🚀 Features

### Trainer Management

- Invite members via unique registration links
- Approve or reject member sign-ups
- Manage member profiles and progress

### Member Management

- Streamlined registration process
- Profile management
- Health metric tracking
- Progress monitoring

### Workout & Nutrition Planning

- Create and edit workout plans
- Design nutrition macros
- Set-by-set workout logging
- Comprehensive exercise library

### Activity Logging

- Workout logging (reps, weight, duration)
- Nutrition tracking (calories, macros)
- Progress visualization

### Gamification

- Challenges and competitions
- Achievement badges
- Point system
- Leaderboards

### Reporting

- Trainer dashboards
- Admin analytics
- Member progress reports
- Financial tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: JavaScript (ES2024)
- **Database**: MySQL (Docker)
- **DB Library**: mysql2/promise
- **Styling**:
  - Tailwind CSS
  - shadcn/ui
  - lucide-react icons
- **Testing**: Jest + Testing Library
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
fittrack/
├── app/                 # Next.js app router pages
├── components/         # React components
├── actions/           # Server actions
├── lib/              # Utility functions and DB
├── hooks/            # Custom React hooks
├── data/             # Static data (exercises)
├── public/           # Static assets
├── schemas/          # Data validation schemas
└── docs/             # Project documentation
```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Start MySQL container:
   ```bash
   docker-compose up -d
   ```

## 📚 Documentation

Detailed documentation is available in the `docs` directory:

- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Component Library](docs/components.md)
- [Authentication](docs/auth.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
