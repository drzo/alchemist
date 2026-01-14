/**
 * Alchemist Engine Example
 * 
 * Demonstrates the Alchemist Engine and Reactor Vessel in action
 * with practical tensor transformation pipelines.
 */

import {
  createTensor,
  AlchemistEngine,
  ReactorVessel,
} from '../src/tensor-logic';

console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                   ALCHEMIST ENGINE DEMONSTRATION                      ║
║                 Tensor Transmutation with Reactor Vessel              ║
╚═══════════════════════════════════════════════════════════════════════╝
`);

// ============================================================================
// EXAMPLE 1: Simple Data Preprocessing Pipeline
// ============================================================================

console.log('\n📊 Example 1: Data Preprocessing Pipeline');
console.log('═'.repeat(70));

const engine = new AlchemistEngine({ maxHistorySize: 50 });

// Define a preprocessing elixir
const preprocessingElixir = {
  id: 'data_preprocessing',
  name: 'Data Preprocessing Pipeline',
  description: 'Normalize, scale, and clip data for ML',
  steps: [
    {
      id: 'normalize',
      name: 'Min-Max Normalization',
      type: 'custom' as const,
      customFn: (tensor) => {
        const min = Math.min(...tensor.data);
        const max = Math.max(...tensor.data);
        const range = max - min || 1;
        
        return createTensor(
          'normalized',
          tensor.indices,
          tensor.shape,
          new Float64Array(tensor.data.map(x => (x - min) / range))
        );
      },
    },
    {
      id: 'scale',
      name: 'Scale to Range',
      type: 'custom' as const,
      customFn: (tensor) => {
        // Scale from [0,1] to [-1, 1]
        return createTensor(
          'scaled',
          tensor.indices,
          tensor.shape,
          new Float64Array(tensor.data.map(x => x * 2 - 1))
        );
      },
    },
    {
      id: 'clip',
      name: 'Clip Outliers',
      type: 'custom' as const,
      customFn: (tensor) => {
        return createTensor(
          'clipped',
          tensor.indices,
          tensor.shape,
          new Float64Array(tensor.data.map(x => Math.max(-0.9, Math.min(0.9, x))))
        );
      },
    },
  ],
};

engine.registerElixir(preprocessingElixir);

// Create sample data with outliers
const rawData = createTensor('raw', ['i'], [10], new Float64Array([
  -50, 10, 20, 30, 40, 50, 60, 70, 80, 200
]));

console.log('\n🔬 Raw Data:', Array.from(rawData.data).map(x => x.toFixed(1)).join(', '));

const preprocessed = engine.transmute('data_preprocessing', { input: rawData });

console.log('✨ Processed Data:', Array.from(preprocessed.output.data).map(x => x.toFixed(3)).join(', '));
console.log(`⏱️  Execution Time: ${preprocessed.executionTimeMs}ms`);
console.log(`📈 Steps: ${preprocessed.intermediates.map(i => i.stepName).join(' → ')}`);

// ============================================================================
// EXAMPLE 2: Neural Network Layer Simulation
// ============================================================================

console.log('\n\n🧠 Example 2: Neural Network Layer Simulation');
console.log('═'.repeat(70));

const neuralElixir = {
  id: 'neural_layer',
  name: 'Neural Network Layer',
  description: 'Simulates a neural network layer with activation',
  steps: [
    {
      id: 'weighted_sum',
      name: 'Weighted Sum',
      type: 'custom' as const,
      customFn: (tensor) => {
        // Simulate weights * inputs + bias
        const weights = [0.5, -0.3, 0.7, 0.2];
        const bias = 0.1;
        
        const weighted = tensor.data.map((x, i) => 
          x * weights[i % weights.length]
        );
        
        const sum = weighted.reduce((a, b) => a + b, 0) + bias;
        
        return createTensor(
          'weighted',
          ['o'],
          [1],
          new Float64Array([sum])
        );
      },
    },
    {
      id: 'activation',
      name: 'ReLU Activation',
      type: 'activation' as const,
      activation: 'relu' as const,
    },
  ],
};

engine.registerElixir(neuralElixir);

const neuralInput = createTensor('input', ['i'], [4], new Float64Array([1, 2, 3, 4]));

console.log('\n🔬 Input Vector:', Array.from(neuralInput.data).join(', '));

const neuralOutput = engine.transmute('neural_layer', { input: neuralInput });

console.log('✨ Layer Output:', Array.from(neuralOutput.output.data).map(x => x.toFixed(4)).join(', '));

// ============================================================================
// EXAMPLE 3: Reactor Vessel with Safety Constraints
// ============================================================================

console.log('\n\n🏭 Example 3: Reactor Vessel with Safety Monitoring');
console.log('═'.repeat(70));

const vessel = new ReactorVessel(engine, {
  maxTensorSize: 1000,
  maxExecutionTimeMs: 5000,
  maxSteps: 10,
});

// Track reactor events
const events: string[] = [];
vessel.on((event) => {
  const timestamp = new Date(event.timestamp).toLocaleTimeString();
  events.push(`[${timestamp}] ${event.type}`);
  
  if (event.type === 'state_change') {
    console.log(`  🔄 State: ${(event.data as any).state}`);
  } else if (event.type === 'progress') {
    const data = event.data as any;
    const pct = (data.progress * 100).toFixed(0);
    console.log(`  ⏳ Progress: ${pct}% ${data.currentStep ? `(${data.currentStep})` : ''}`);
  } else if (event.type === 'warning') {
    console.log(`  ⚠️  Warning: ${(event.data as any).message}`);
  }
});

console.log('\n🚀 Executing transformation in reactor vessel...\n');

const vesselResult = await vessel.execute('data_preprocessing', { input: rawData });

console.log('\n📊 Summary Report:');
console.log(vessel.getSummaryReport());

console.log(`\n📋 Event Log (${events.length} events captured):`);
events.forEach(e => console.log(`  ${e}`));

// ============================================================================
// EXAMPLE 4: Complex Pipeline with Multiple Stages
// ============================================================================

console.log('\n\n🔮 Example 4: Complex Multi-Stage Pipeline');
console.log('═'.repeat(70));

const complexElixir = {
  id: 'image_classifier',
  name: 'Image Classification Pipeline',
  description: 'Complete pipeline: preprocessing → feature extraction → classification',
  steps: [
    {
      id: 'normalize',
      name: 'Normalize Pixels',
      type: 'custom' as const,
      customFn: (tensor) => {
        // Normalize to [0, 1]
        const max = Math.max(...tensor.data);
        return createTensor(
          'normalized_pixels',
          tensor.indices,
          tensor.shape,
          new Float64Array(tensor.data.map(x => x / max))
        );
      },
    },
    {
      id: 'features',
      name: 'Extract Features',
      type: 'custom' as const,
      customFn: (tensor) => {
        // Simple feature: average value per quadrant
        const data = Array.from(tensor.data);
        const mid = Math.floor(data.length / 2);
        
        const features = [
          data.slice(0, mid).reduce((a, b) => a + b, 0) / mid,
          data.slice(mid).reduce((a, b) => a + b, 0) / (data.length - mid),
        ];
        
        return createTensor(
          'features',
          ['f'],
          [2],
          new Float64Array(features)
        );
      },
    },
    {
      id: 'softmax',
      name: 'Classification Probabilities',
      type: 'activation' as const,
      activation: 'softmax' as const,
    },
    {
      id: 'argmax',
      name: 'Predict Class',
      type: 'custom' as const,
      customFn: (tensor) => {
        const maxIdx = tensor.data.indexOf(Math.max(...tensor.data));
        const prediction = new Float64Array(tensor.data.length).fill(0);
        prediction[maxIdx] = 1;
        
        return createTensor(
          'prediction',
          tensor.indices,
          tensor.shape,
          prediction
        );
      },
    },
  ],
};

engine.registerElixir(complexElixir);

// Simulate a small image (8 pixels)
const imageData = createTensor('image', ['p'], [8], new Float64Array([
  120, 130, 140, 150,  // Top half (brighter)
  60, 70, 80, 90,      // Bottom half (darker)
]));

console.log('\n🔬 Input Image (8 pixels):', Array.from(imageData.data).map(x => x.toFixed(0)).join(', '));

const classified = engine.transmute('image_classifier', { input: imageData });

console.log('✨ Classification:', Array.from(classified.output.data).join(', '));
console.log(`📊 Predicted Class: ${classified.output.data.indexOf(1)}`);

console.log('\n📈 Pipeline Stages:');
classified.intermediates.forEach((step, i) => {
  console.log(`  ${i + 1}. ${step.stepName}`);
  console.log(`     Output: [${Array.from(step.result.data).map(x => x.toFixed(3)).slice(0, 5).join(', ')}${step.result.data.length > 5 ? '...' : ''}]`);
});

// ============================================================================
// EXAMPLE 5: History and Metrics
// ============================================================================

console.log('\n\n📜 Example 5: Transformation History');
console.log('═'.repeat(70));

const history = engine.getHistory();

console.log(`\n📊 Total transformations in history: ${history.length}`);
console.log('\nRecent transformations:');

history.slice(-5).forEach((trans, i) => {
  console.log(`\n  ${i + 1}. ${engine.getElixir(trans.elixirId)?.name || trans.elixirId}`);
  console.log(`     Steps: ${trans.intermediates.length}`);
  console.log(`     Time: ${trans.executionTimeMs}ms`);
  console.log(`     Warnings: ${trans.warnings.length}`);
});

console.log('\n💾 Performance Summary:');
const avgTime = history.reduce((sum, t) => sum + t.executionTimeMs, 0) / history.length;
const totalSteps = history.reduce((sum, t) => sum + t.intermediates.length, 0);

console.log(`  Average execution time: ${avgTime.toFixed(2)}ms`);
console.log(`  Total steps executed: ${totalSteps}`);
console.log(`  Total transformations: ${history.length}`);

// ============================================================================
// CONCLUSION
// ============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                        DEMONSTRATION COMPLETE                         ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  ✓ Data Preprocessing Pipeline                                       ║
║  ✓ Neural Network Layer Simulation                                   ║
║  ✓ Reactor Vessel with Safety Monitoring                             ║
║  ✓ Complex Multi-Stage Pipeline                                      ║
║  ✓ Transformation History and Metrics                                ║
║                                                                       ║
║  The Alchemist Engine provides a powerful, safe, and monitored       ║
║  framework for tensor transformations in the Neural Nestor Gauge     ║
║  Logic system.                                                        ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
`);
