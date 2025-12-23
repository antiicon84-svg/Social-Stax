# Contributing to Social-Stax

Thank you for your interest in contributing to Social-Stax! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Development Setup

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
   # Edit .env.local with your development credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## 📋 Code Quality Standards

### TypeScript

- All code should be written in TypeScript
- Type all function parameters and return types
- Avoid `any` types - use `unknown` and proper type guards if needed
- Use interfaces for complex objects

### React Components

- Use functional components with hooks
- Use descriptive component names (PascalCase)
- Extract complex logic into custom hooks
- Add JSDoc comments for public components

### File Organization

```
project/
├── components/          # Reusable React components
├── views/               # Page-level components
├── services/            # Business logic & API calls
├── utils/               # Utility functions
├── types.ts             # Type definitions
├── constants.ts         # Constants
└── App.tsx              # Root component
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Functions/Variables**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_TIMEOUT`)
- **Types/Interfaces**: PascalCase (e.g., `UserProfile`)

## 🐛 Bug Reports

If you find a bug:

1. **Check existing issues** - Don't create duplicates
2. **Create a detailed report** including:
   - What you expected to happen
   - What actually happened
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

## ✨ Feature Requests

1. **Describe the feature** - What problem does it solve?
2. **Provide examples** - How would it be used?
3. **Discuss alternatives** - Are there other approaches?

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Keep commits atomic and descriptive
   - Reference issues in commit messages: `Fix: Resolve issue #123`

3. **Test your changes**
   ```bash
   npm run build
   npm run type-check
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Provide a clear description of changes
   - Link related issues
   - Include screenshots for UI changes
   - Ensure CI checks pass

## 📝 Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Type
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (no functional change)
- `refactor:` Code refactor
- `perf:` Performance improvement
- `test:` Adding/updating tests
- `chore:` Build, dependencies, etc.

### Example
```
feat: Add user authentication with Google

Implement Google OAuth sign-in flow for user authentication.
Users can now sign in using their Google account.

Closes #123
```

## 🔐 Security

**IMPORTANT:** Never commit sensitive information like:
- API keys
- Passwords
- Database credentials
- Private tokens

Always use environment variables. See [SECURITY.md](./SECURITY.md) for details.

## 📚 Documentation

- Update README.md if you add new features
- Add JSDoc comments to complex functions
- Update FEATURE_SUMMARY.md if adding major features
- Document API changes in relevant files

## 🧪 Testing

While we don't have automated tests yet, please:
- Manually test your changes
- Test on different browsers/devices if applicable
- Ask for testing help if needed

## 💬 Questions?

- Check existing documentation
- Review similar code in the project
- Open an issue for clarification

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Social-Stax!** 🎉
