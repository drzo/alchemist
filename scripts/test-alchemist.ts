/**
 * Tests for Alchemist Engine and Reactor Vessel
 * 
 * Validates the tensor transformation pipeline with safety constraints.
 */

import {
  createTensor as _createTensor,
  AlchemistEngine,
  ReactorVessel,
  Elixir,
  TransmutationStep,
} from '../src/tensor-logic';

// Helper function for simpler tensor creation in tests
function createTensor(shape: number[], data: number[] | Float64Array): ReturnType<typeof _createTensor> {
  const indices = shape.map((_, i) => String.fromCharCode(97 + i)); // a, b, c, ...
  return _createTensor(
    `tensor_${Math.random().toString(36).substr(2, 6)}`,
    indices,
    shape,
    data instanceof Float64Array ? data : new Float64Array(data)
  );
}

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function testHeader(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

function pass(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function fail(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function info(message: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${colors.dim}${message}${colors.reset}`);
}

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    pass(message);
  } else {
    fail(message);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertAlmostEqual(
  actual: number,
  expected: number,
  tolerance: number,
  message: string
) {
  const diff = Math.abs(actual - expected);
  assert(diff < tolerance, `${message} (diff: ${diff})`);
}

// ============================================================================
// TEST: Alchemist Engine - Basic Registration
// ============================================================================
testHeader('Alchemist Engine - Basic Registration');

const engine = new AlchemistEngine();

const simpleElixir: Elixir = {
  id: 'simple_test',
  name: 'Simple Test Elixir',
  description: 'A basic elixir for testing',
  steps: [
    {
      id: 'step1',
      name: 'Identity',
      type: 'custom',
      customFn: (t) => t,
    },
  ],
};

engine.registerElixir(simpleElixir);
assert(
  engine.getElixir('simple_test') !== undefined,
  'Can register and retrieve elixir'
);

const elixirs = engine.listElixirs();
assert(elixirs.length === 1, 'List elixirs returns correct count');
assert(elixirs[0].id === 'simple_test', 'Listed elixir has correct ID');

// ============================================================================
// TEST: Alchemist Engine - Logic Programming Elixir
// ============================================================================
testHeader('Alchemist Engine - Logic Programming Elixir');

// Create ancestor relation
const ancestor = createTensor([3, 3], [
  1, 1, 0,
  0, 1, 1,
  0, 0, 1,
]);

// Create parent relation
const parent = createTensor([3, 3], [
  0, 1, 0,
  0, 0, 1,
  0, 0, 0,
]);

const logicElixir = AlchemistEngine.createLogicElixir(ancestor);
engine.registerElixir(logicElixir);

const logicResult = engine.transmute('logic_elixir', {
  ancestor,
  parent,
});

assert(logicResult.output !== undefined, 'Logic elixir produces output');
assert(logicResult.intermediates.length > 0, 'Logic elixir records intermediate steps');
assert(logicResult.warnings.length === 0, 'Logic elixir completes without warnings');
info(`Execution time: ${logicResult.executionTimeMs}ms`);

// ============================================================================
// TEST: Alchemist Engine - Custom Transformation
// ============================================================================
testHeader('Alchemist Engine - Custom Transformation');

const customElixir: Elixir = {
  id: 'custom_transform',
  name: 'Custom Transformation',
  description: 'Applies a custom function to scale tensors',
  steps: [
    {
      id: 'scale',
      name: 'Scale by 2',
      type: 'custom',
      customFn: (tensor) => {
        return createTensor(
          tensor.shape,
          tensor.data.map(x => x * 2)
        );
      },
    },
    {
      id: 'threshold',
      name: 'Apply Threshold',
      type: 'threshold',
      thresholdValue: 0.5,
    },
  ],
};

engine.registerElixir(customElixir);

const inputTensor = createTensor([2, 2], [0.1, 0.3, 0.6, 0.8]);
const customResult = engine.transmute('custom_transform', {
  input: inputTensor,
});

assert(customResult.output.shape.length === 2, 'Custom transform preserves shape dimensions');
assert(
  customResult.intermediates.length === 2,
  'Custom transform records both steps'
);
info(`Input: [${inputTensor.data.slice(0, 4).join(', ')}]`);
info(`Output: [${customResult.output.data.slice(0, 4).join(', ')}]`);

// ============================================================================
// TEST: Alchemist Engine - Activation Functions
// ============================================================================
testHeader('Alchemist Engine - Activation Functions');

const activationElixir: Elixir = {
  id: 'activation_test',
  name: 'Activation Test',
  description: 'Test various activation functions',
  steps: [
    {
      id: 'sigmoid',
      name: 'Sigmoid Activation',
      type: 'activation',
      activation: 'sigmoid',
    },
  ],
};

engine.registerElixir(activationElixir);

const activationInput = createTensor([1, 3], [0, 1, -1]);
const activationResult = engine.transmute('activation_test', {
  input: activationInput,
});

assert(activationResult.output !== undefined, 'Activation elixir produces output');
assert(
  activationResult.output.data.every(x => x >= 0 && x <= 1),
  'Sigmoid output is in range [0, 1]'
);
assertAlmostEqual(
  activationResult.output.data[0],
  0.5,
  0.01,
  'Sigmoid(0) ≈ 0.5'
);

// ============================================================================
// TEST: Reactor Vessel - Basic Execution
// ============================================================================
testHeader('Reactor Vessel - Basic Execution');

const vessel = new ReactorVessel(engine, {
  maxTensorSize: 1_000_000,
  maxExecutionTimeMs: 30_000,
});

let stateChanges: string[] = [];
let progressUpdates: number[] = [];

vessel.on((event) => {
  if (event.type === 'state_change') {
    const data = event.data as { state: string };
    stateChanges.push(data.state);
  } else if (event.type === 'progress') {
    const data = event.data as { progress: number };
    progressUpdates.push(data.progress);
  }
});

const vesselResult = await vessel.execute('simple_test', {
  input: createTensor([2], [1, 2]),
});

assert(vesselResult !== undefined, 'Reactor vessel executes successfully');
assert(stateChanges.includes('PREPARING'), 'Vessel enters PREPARING state');
assert(stateChanges.includes('TRANSMUTING'), 'Vessel enters TRANSMUTING state');
assert(stateChanges.includes('STABILIZING'), 'Vessel enters STABILIZING state');
assert(stateChanges.includes('COMPLETE'), 'Vessel enters COMPLETE state');
assert(progressUpdates.length > 0, 'Vessel reports progress updates');
assert(
  progressUpdates[progressUpdates.length - 1] === 1.0,
  'Final progress is 100%'
);

const status = vessel.getStatus();
info(`Final state: ${status.state}`);
info(`Operations: ${status.resources.operationCount}`);
info(`Memory used: ${(status.resources.memoryBytes / 1024).toFixed(2)} KB`);

// ============================================================================
// TEST: Reactor Vessel - Safety Constraints
// ============================================================================
testHeader('Reactor Vessel - Safety Constraints');

const strictVessel = new ReactorVessel(engine, {
  maxTensorSize: 10, // Very small limit
  maxSteps: 5,
});

const largeTensor = createTensor([20], new Array(20).fill(1));

let errorCaught = false;
try {
  await strictVessel.execute('simple_test', { input: largeTensor });
} catch (error) {
  errorCaught = true;
  const message = error instanceof Error ? error.message : '';
  assert(
    message.includes('exceeds maximum size'),
    'Vessel enforces tensor size limit'
  );
}

assert(errorCaught, 'Vessel throws error for oversized tensor');

// ============================================================================
// TEST: Reactor Vessel - Real-time Monitoring
// ============================================================================
testHeader('Reactor Vessel - Real-time Monitoring');

const monitorVessel = new ReactorVessel(engine);
const events: string[] = [];

monitorVessel.on((event) => {
  events.push(event.type);
});

await monitorVessel.execute('activation_test', {
  input: createTensor([1, 5], [1, 2, 3, 4, 5]),
});

assert(events.includes('state_change'), 'Monitor captures state changes');
assert(events.includes('progress'), 'Monitor captures progress');
assert(events.includes('step_complete'), 'Monitor captures step completion');
assert(events.includes('complete'), 'Monitor captures completion');

info(`Total events captured: ${events.length}`);

// ============================================================================
// TEST: Reactor Vessel - Summary Report
// ============================================================================
testHeader('Reactor Vessel - Summary Report');

const report = monitorVessel.getSummaryReport();
assert(report.includes('REACTOR VESSEL SUMMARY'), 'Report has header');
assert(report.includes('State:'), 'Report includes state');
assert(report.includes('Execution Time:'), 'Report includes execution time');
assert(report.includes('Operations:'), 'Report includes operation count');
assert(report.includes('Memory Used:'), 'Report includes memory usage');

info('Summary Report:');
console.log(colors.dim + report + colors.reset);

// ============================================================================
// TEST: Integration - Complex Pipeline
// ============================================================================
testHeader('Integration - Complex Pipeline');

const complexElixir: Elixir = {
  id: 'complex_pipeline',
  name: 'Complex Transformation Pipeline',
  description: 'Multi-step transformation with validation',
  steps: [
    {
      id: 'normalize',
      name: 'Normalize Input',
      type: 'custom',
      customFn: (tensor) => {
        const max = Math.max(...tensor.data);
        return createTensor(
          tensor.shape,
          tensor.data.map(x => x / max)
        );
      },
    },
    {
      id: 'activate',
      name: 'Apply Sigmoid',
      type: 'activation',
      activation: 'sigmoid',
    },
    {
      id: 'threshold',
      name: 'Binary Classification',
      type: 'threshold',
      thresholdValue: 0.5,
    },
  ],
};

engine.registerElixir(complexElixir);

const integrationVessel = new ReactorVessel(engine);
const complexInput = createTensor([1, 4], [100, 200, 50, 150]);

const complexResult = await integrationVessel.execute('complex_pipeline', {
  input: complexInput,
});

assert(complexResult.intermediates.length === 3, 'All steps executed');
assert(complexResult.output !== undefined, 'Pipeline produces output');
assert(
  complexResult.output.data.every(x => x === 0 || x === 1),
  'Final output is binary'
);

info(`Input: [${complexInput.data.join(', ')}]`);
info(`Output: [${complexResult.output.data.join(', ')}]`);
info(`Steps: ${complexResult.intermediates.map(i => i.stepName).join(' → ')}`);

// ============================================================================
// TEST: History Tracking
// ============================================================================
testHeader('History Tracking');

const history = engine.getHistory();
assert(history.length > 0, 'Engine maintains transformation history');
assert(history.every(h => h.elixirId !== undefined), 'History entries have elixir ID');
assert(history.every(h => h.executionTimeMs >= 0), 'History entries have execution time');

info(`Total transformations in history: ${history.length}`);

engine.clearHistory();
assert(engine.getHistory().length === 0, 'History can be cleared');

// ============================================================================
// SUMMARY
// ============================================================================
console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.bright}  TEST SUMMARY${colors.reset}`);
console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`Total Tests: ${colors.bright}${totalTests}${colors.reset}`);
console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
console.log(`Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`);

if (passedTests === totalTests) {
  console.log(`\n${colors.green}${colors.bright}✓ All tests passed!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}${colors.bright}✗ Some tests failed${colors.reset}\n`);
  process.exit(1);
}
