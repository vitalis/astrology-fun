# Astrology Fun - Birth Chart Calculator

A beautiful, modern astrology birth chart calculator built with React, TypeScript, and Tailwind CSS.

## Features

- Beautiful gradient UI with Tailwind CSS
- Comprehensive birth data form with validation
- Place autocomplete using OpenStreetMap Nominatim API
- Automatic latitude, longitude, and UTC offset calculation
- Full test coverage with Vitest
- CI/CD pipeline with GitHub Actions
- Deployed on Vercel

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Testing

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run coverage
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Form Fields

- **Name** (optional) - Your full name
- **Date of Birth** (required) - Your birth date
- **Time of Birth** (required) - Your exact birth time
- **Place of Birth** (required) - City/location with autocomplete
  - Automatically fills latitude, longitude, and UTC offset
- **Latitude** (read-only) - Auto-calculated from place
- **Longitude** (read-only) - Auto-calculated from place
- **UTC Offset** (read-only) - Auto-calculated from coordinates

## Deployment

### Vercel (Recommended)

This project is configured for easy deployment to Vercel:

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Push your code to GitHub
   - Import your repository at [vercel.com/new](https://vercel.com/new)
   - Vercel will auto-detect Vite and configure everything

3. **Deploy via CLI**:
   ```bash
   vercel
   ```

### GitHub Actions (Automated)

The project includes a GitHub Actions workflow that:
- Runs tests on every push
- Runs linting checks
- Builds the project
- Deploys to Vercel on main/master branch (requires secrets)

**Required GitHub Secrets for auto-deployment:**
- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

## Project Structure

```
astrology-fun/
├── src/
│   ├── components/
│   │   ├── BirthForm.tsx          # Main form component
│   │   └── BirthForm.test.tsx     # Form tests
│   ├── test/
│   │   └── setup.ts               # Test setup
│   ├── App.tsx                    # Main app component
│   ├── index.css                  # Global styles
│   └── main.tsx                   # App entry point
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions workflow
├── public/                        # Static assets
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
├── vercel.json                    # Vercel configuration
└── package.json
```

## Testing

The project has comprehensive test coverage including:

- Form rendering tests
- Field validation tests
- User interaction tests
- Place autocomplete functionality tests
- Form submission tests

All tests use Vitest and React Testing Library for reliable, maintainable testing.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Acknowledgments

- Place data provided by [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)
- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
