# PureList

PureList is a client-side utility for support and client-facing teams who need to clean, transform, split, and compare large ID lists quickly and safely. All processing happens in the browser memory only: no backend, no network transfer of user data, no server-side storage.

## Features

- Deduplication with preserved first occurrence order
- Format transformation with configurable output separator
- Chunking large lists into smaller copy-ready blocks
- List comparison with intersection and unique results for both sides
- Dirty input parsing for new lines, commas, and semicolons
- `trim()` sanitization on every token and empty value removal
- Copy-to-clipboard with toast feedback
- Light and dark themes

## Tech Stack

- Vite
- React 19
- TypeScript with strict mode
- Tailwind CSS
- Local shadcn-inspired UI primitives
- Vercel-ready static deployment

## Local Development

### Requirements

- Node.js `24.14.1` or newer
- npm `10+`

### Install

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Data Rules

- IDs are treated as strings
- Matching is case-sensitive
- Input is split by:
  - newline `\n`
  - comma `,`
  - semicolon `;`
- Every value is normalized with `trim()`
- Empty rows are ignored
- The app is intended to stay responsive with lists up to `100,000` IDs by using `Set`-based operations

## Project Structure

```text
src/
  components/
    ui/
  lib/
  App.tsx
  index.css
  main.tsx
```

## Deployment to Vercel

This project is a static Vite application and is ready for Vercel deployment.

### Option 1: Import repository in Vercel

1. Create a new Vercel project from the repository.
2. Vercel should detect the Vite framework automatically.
3. Use these values if prompted:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### Option 2: Vercel CLI

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

## Security

- No backend
- No external API calls for list processing
- No persistence layer
- Browser-only memory processing

## Notes

- If you use `nvm`, the repository includes `.nvmrc`.
- If `node` is installed but unavailable in your shell, run:

```bash
nvm use
```