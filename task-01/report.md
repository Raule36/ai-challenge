# Task 01: Leaderboard Page Replica — Report

## Approach

I started by studying the original leaderboard page to understand its structure, layout, and functionality. First, I built a rough interface on my own to get a feel for the component hierarchy and data flow. Then I took screenshots of the original page, blurred all sensitive data (real names, department names, titles), and fed them to an AI assistant to help identify exact spacing, colors, and layout details I might have missed.

I also researched the original site's source code and discovered it was built with `@fluentui/react` (Microsoft's Fluent UI library). Since the original relied on Fluent UI components like Dropdown, SearchBox, Icon, and TooltipHost, I decided to use the same library to achieve a closer visual match without reinventing those controls.

## Tech Stack

- **React 19** + **TypeScript** + **Vite** — fast dev setup with strict type checking
- **@fluentui/react** — matching the original's Dropdown, SearchBox, Spinner, Icon, TooltipHost, and MessageBar components
- **date-fns** — date formatting (`dd-MMM-yyyy`) to match the original's activity date display
- **CSS Modules** — scoped styles replicating the original's class-based styling with exact colors, spacing, and responsive breakpoints

## Data Replacement

All original data was replaced with a completely fictional sci-fi themed dataset:

- **18 fictional employees** with invented names (e.g., Zara Voss, Kael Orion, Lyra Chen)
- **Fictional departments**: Starship Division, Quantum Lab, Nebula Operations, Stellar Academy, Cosmic Research
- **Fictional roles**: Warp Field Engineer, Stellar Cartographer, Quantum Analyst, etc.
- **3 activity categories**: Education, Public Speaking, University Partnership
- **81 activity records** spanning 2024-2025, with point values from 5 to 50

The mock data is stored in a static JSON file and processed client-side using the same aggregation logic as the original: grouping by person, summing scores, building category breakdowns, and sorting by total points.

## Features Replicated

- **Header** with title and subtitle
- **Filter bar** with Year, Quarter, and Category dropdowns plus a search box
- **Podium** displaying the top 3 performers with rank-specific styling (gold/silver/bronze)
- **User list** showing all participants with rank, avatar initials, category stat icons with tooltips, and total score
- **Expandable rows** revealing a detailed activity table with color-coded category badges
- **Empty state** message when filters return no results
- **Responsive layout** with a single breakpoint at 768px matching the original's mobile behavior

## Deployment

The app is deployed to GitHub Pages using the `gh-pages` package with Vite's `base` path configured for the repository.
