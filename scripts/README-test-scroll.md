# Scroll Behavior Test Script

<!-- TOC -->

- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Test All Steps](#test-all-steps)
  - [Test Specific Example](#test-specific-example)
  - [Test Specific Step](#test-specific-step)
  - [Run in Headed Mode (See Browser)](#run-in-headed-mode-see-browser)
  - [Custom Port](#custom-port)
- [How It Works](#how-it-works)
- [Expected Behavior](#expected-behavior)
- [Exit Codes](#exit-codes)
- [Example Output](#example-output)
- [Troubleshooting](#troubleshooting)
  - [Port Already in Use](#port-already-in-use)
  - [Browser Not Found](#browser-not-found)
  - [Tests Failing](#tests-failing)
  - [Timeout Issues](#timeout-issues)

<!-- /TOC -->
This script tests the scroll behavior when navigating between steps in the Tensor Logic examples using Puppeteer (headless browser automation).

## Installation

First, install the required dependencies:

```bash
npm install
```

This will install:
- `puppeteer` - Headless browser automation
- `tsx` - TypeScript execution for Node.js

## Usage

### Basic Usage

Test the default example (MLP) with the first 5 steps:

```bash
npm run test:scroll
```

### Test All Steps

Test all steps in the default example:

```bash
npm run test:scroll:all
```

Or:

```bash
npm run test:scroll -- --all-steps
```

### Test Specific Example

Test a specific example:

```bash
npm run test:scroll -- --example=gnn
npm run test:scroll -- --example=transformer
npm run test:scroll -- --example=logic
```

Available examples:
- `logic` - Logic Programming
- `mlp` - Multi-Layer Perceptron
- `mlp-batch` - MLP Batch Processing
- `transformer` - Transformer (Self-Attention)
- `multihead` - Multi-Head Attention
- `gnn` - Graph Neural Network
- `kernel` - Kernel Machines (SVM)
- `bayesian` - Bayesian Network
- `hmm` - Hidden Markov Model

### Test Specific Step

Test a specific step in an example:

```bash
npm run test:scroll -- --example=mlp --step=3
```

### Run in Headed Mode (See Browser)

Run with visible browser window (useful for debugging):

```bash
npm run test:scroll -- --headed
```

### Custom Port

If port 5173 is already in use:

```bash
npm run test:scroll -- --port=5174
```

## How It Works

1. **Starts Dev Server**: Automatically starts Vite dev server on the specified port
2. **Launches Browser**: Opens a headless (or headed) browser instance
3. **Loads Example**: Navigates to the page and clicks the specified example
4. **Tests Steps**: 
   - Clicks through steps using Next/Previous buttons
   - Waits for transitions to complete (250ms + buffer)
   - Waits for smooth scroll to complete (600ms)
   - Measures the actual scroll position
5. **Validates**: Checks if the step's top edge is within 10px of the expected position (140px from viewport top, accounting for fixed header)
6. **Reports Results**: Prints pass/fail for each step and summary statistics

## Expected Behavior

For each step, the test verifies that:
- The step's top edge is positioned at 140px from the viewport top (just below the fixed header)
- The error is less than 10px (tolerance)

## Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

## Example Output

```
🚀 Starting scroll behavior test...
Options: { headless: true, port: 5173 }

📦 Starting dev server...
✅ Dev server running at http://localhost:5173

🌐 Launching browser...
✅ Browser launched

🌐 Opening http://localhost:5173...
📋 Loading example: mlp...

✅ Found 9 steps

🧪 Testing first 5 steps...

  Testing step 0...
    ✅ Step 0 (Overview): Expected: 140px, Actual: 140.0px, Error: 0.0px
  Testing step 1...
    ✅ Step 1 (Input Layer): Expected: 140px, Actual: 140.0px, Error: 0.0px
  Testing step 2...
    ✅ Step 2 (Hidden Layer Weights): Expected: 140px, Actual: 140.0px, Error: 0.0px
  Testing step 3...
    ✅ Step 3 (Hidden Pre-activations): Expected: 140px, Actual: 140.0px, Error: 0.0px
  Testing step 4...
    ✅ Step 4 (Hidden Activations): Expected: 140px, Actual: 140.0px, Error: 0.0px

============================================================
📊 Test Summary
============================================================
Total tests: 5
✅ Passed: 5
❌ Failed: 0

✅ All tests passed!
```

## Troubleshooting

### Port Already in Use

If you get an error about the port being in use:

```bash
npm run test:scroll -- --port=5174
```

### Browser Not Found

Puppeteer will automatically download Chromium on first run. If it fails, you may need to:

1. Check your internet connection
2. Set `PUPPETEER_SKIP_DOWNLOAD=true` and install Chromium manually
3. Use `PUPPETEER_EXECUTABLE_PATH` to point to an existing Chrome/Chromium installation

### Tests Failing

If tests are failing:

1. Run with `--headed` to see what's happening visually
2. Check that the dev server started correctly
3. Verify the example has the expected number of steps
4. Check browser console for JavaScript errors

### Timeout Issues

If the dev server takes too long to start, the script will timeout after 30 seconds. Make sure:
- No other process is using the port
- Vite can start normally (`npm run dev` works)
- Your system has sufficient resources

