# Dev Tools Suite

This project is a collection of dev tools mainly aimed at web development. The goal is to to provide a clean and accessible alternative to many online tools that are often riddled with intrusive ads, poor UX, or even malicious behavior.

More tools and features are coming once I scrounge up some free time.

## Current Tools

**Color Generator**
- Generates a color palette of your choice (Complementary, Triadic, Tetradic, Monochromatic, Analogous) based on your input color
- Outputs colors in OKLCH, HEX, HSL, or RGB
- Accessibility guide for using colors on white or black backgrounds
- Option to copy each individual color, or export the entire palette as variables in CSS, SCSS, or JSON

**JSON Formatter**
- Automatic formatting and validation of your JSON input
- Option to minify JSON

## Local Setup

**Requirements**
- Node.js 18+ (built with v24.4.0)

**Quick Start**

clone repo and navigate to project folder
```bash
git clone https://github.com/lukas0108/dev_tools_suite.git
```
```bash
cd dev_tools_suite
```

install dependencies
```bash
npm install
```

run locally
```bash
npm run dev
```

Open `http://localhost:5173` in your browser, or ctrl+click the URL provided in the terminal. If the default port is in use, Vite will choose the next available one.

**Tech Stack**
- Vite 7.0.4 + React 19.1.0 + Tailwind 4.0.0

## Future Plans

Strongly considering making this a desktop app in the future for more complex or potentially bandwidth-heavy tools. 

Future focus will be mainly front-end tools, like img conversion, dead css purge, etc.

If you have any other suggestions for tools or features that you would like to see included, they will be hugely appreciated.
