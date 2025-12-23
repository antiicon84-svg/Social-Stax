# Social-Stax 📱

A powerful social media management platform powered by AI. Create, schedule, and manage content across multiple social platforms with intelligent automation.

## ✨ Features

- **AI-Powered Content Generation** - Generate compelling social media posts using Google Gemini API
- **Multi-Platform Support** - Manage Instagram, LinkedIn, Twitter, and Facebook from one dashboard
- **Smart Scheduling** - Schedule posts at optimal times
- **Brand Management** - Create and maintain detailed brand guidelines
- **Content Templates** - Pre-built templates for quick content creation
- **Analytics Dashboard** - Track performance metrics and engagement
- **Progressive Web App** - Works offline and on mobile devices
- **Cross-Platform** - Web, iOS (AppKit), and Android (Capacitor) support

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Google Cloud account (for Gemini API)
- A Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/antiicon84-svg/Social-Stax.git
   cd Social-Stax
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add:
   - Google API Key from [https://ai.google.dev/](https://ai.google.dev/)
   - Firebase credentials from [Firebase Console](https://console.firebase.google.com)

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📄 Documentation

- **[FEATURE_SUMMARY.md](./FEATURE_SUMMARY.md)** - Detailed feature documentation
- **[USAGE_LIMITS_GUIDE.md](./USAGE_LIMITS_GUIDE.md)** - API usage limits and quotas
- **[SECURITY.md](./SECURITY.md)** - Security guidelines and best practices
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project
- **[.env.example](./.env.example)** - Environment variable template

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **AI**: Google Gemini API
- **Build**: Vite
- **Mobile**: Capacitor + AppKit

## 🔐 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting (when configured)
npm run lint
```

## 🔬 Project Structure

```
Social-Stax/
├── components/          # Reusable React components
├── views/               # Page-level components
├── services/            # Business logic & API integration
├── utils/               # Utility functions
├── App.tsx              # Root component
├── index.tsx            # App entry point
├── index.html           # HTML entry point
├─┠ types.ts             # TypeScript type definitions
├─┠ constants.ts         # Application constants
├─┠ package.json         # Dependencies
├─┠ tsconfig.json        # TypeScript configuration
├─┠ vite.config.ts       # Vite configuration
├─┠ .env.example         # Environment variables template
├─┠ .env.local           # Local environment (not committed)
└─┠ README.md            # This file
```

## 🔐 Security

**Important:** Never commit sensitive information like API keys or passwords to the repository.

- Use `.env.local` for development credentials (not committed)
- Use GitHub Secrets for production deployment
- See [SECURITY.md](./SECURITY.md) for detailed guidelines

## 🧙 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup
- Code quality standards
- Pull request process
- Commit message format
- Security guidelines

## 💫 Support

If you encounter issues or have questions:

1. Check existing [GitHub Issues](https://github.com/antiicon84-svg/Social-Stax/issues)
2. Review documentation files
3. Create a new issue with detailed information

## 📄 License

This project is private and proprietary. All rights reserved.

## 🙋 Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Google Gemini API](https://ai.google.dev/)
- Hosted on [Firebase](https://firebase.google.com/)

---

**Last Updated:** December 23, 2025

**Status:** 🟢 Development
