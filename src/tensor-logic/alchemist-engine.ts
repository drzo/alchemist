/**
 * ALCHEMIST ENGINE
 * 
 * A tensor transformation engine inspired by alchemical transmutation.
 * Transforms tensors through a series of operations while maintaining
 * mathematical rigor and tracking the transformation history.
 * 
 * CONCEPTUAL FRAMEWORK:
 * - **Transmutation**: Transform tensors through einsum operations
 * - **Elixir**: A recipe of transformation steps
 * - **Catalyst**: Activation functions and non-linearities
 * - **Crucible**: The computational context for transformations
 * 
 * This engine works in conjunction with the Reactor Vessel to provide
 * safe, monitored, and reversible tensor transformations.
 */

import {
  Tensor,
  createTensor,
  einsum,
  sigmoid,
  relu,
  softmax,
  threshold,
  clone,
} from './core';

/**
 * A single step in an alchemical transformation.
 */
export interface TransmutationStep {
  /** Unique identifier for this step */
  id: string;
  
  /** Human-readable name of the transformation */
  name: string;
  
  /** Type of transformation */
  type: 'einsum' | 'activation' | 'threshold' | 'custom';
  
  /** Einstein summation notation (for einsum operations) */
  notation?: string;
  
  /** Activation function name (for activation operations) */
  activation?: 'sigmoid' | 'relu' | 'softmax' | 'threshold';
  
  /** Threshold value (for threshold operations) */
  thresholdValue?: number;
  
  /** Custom transformation function */
  customFn?: (input: Tensor) => Tensor;
  
  /** Expected input shape */
  inputShape?: number[];
  
  /** Expected output shape */
  outputShape?: number[];
}

/**
 * An Elixir is a complete recipe for tensor transformation.
 */
export interface Elixir {
  /** Unique identifier */
  id: string;
  
  /** Name of the elixir */
  name: string;
  
  /** Description of what this elixir does */
  description: string;
  
  /** Ordered sequence of transmutation steps */
  steps: TransmutationStep[];
  
  /** Initial tensor configuration */
  initialState?: Record<string, Tensor>;
  
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Result of applying an elixir transformation.
 */
export interface TransmutationResult {
  /** Unique identifier for this transmutation */
  id: string;
  
  /** The elixir that was applied */
  elixirId: string;
  
  /** Input tensors */
  inputs: Record<string, Tensor>;
  
  /** Output tensor */
  output: Tensor;
  
  /** Step-by-step intermediate results */
  intermediates: {
    stepId: string;
    stepName: string;
    result: Tensor;
    timestamp: number;
  }[];
  
  /** Total execution time in milliseconds */
  executionTimeMs: number;
  
  /** Any warnings or validation issues */
  warnings: string[];
  
  /** Timestamp of when this transmutation occurred */
  timestamp: number;
}

/**
 * The Alchemist Engine manages tensor transformations.
 */
export class AlchemistEngine {
  private elixirs: Map<string, Elixir> = new Map();
  private history: TransmutationResult[] = [];
  private maxHistorySize: number;

  constructor(config?: { maxHistorySize?: number }) {
    this.maxHistorySize = config?.maxHistorySize || 100;
  }

  /**
   * Register an elixir (transformation recipe).
   */
  registerElixir(elixir: Elixir): void {
    this.elixirs.set(elixir.id, elixir);
  }

  /**
   * Get a registered elixir by ID.
   */
  getElixir(id: string): Elixir | undefined {
    return this.elixirs.get(id);
  }

  /**
   * List all registered elixirs.
   */
  listElixirs(): Elixir[] {
    return Array.from(this.elixirs.values());
  }

  /**
   * Apply an elixir to transform tensors.
   */
  transmute(
    elixirId: string,
    inputs: Record<string, Tensor>
  ): TransmutationResult {
    const startTime = Date.now();
    const elixir = this.elixirs.get(elixirId);

    if (!elixir) {
      throw new Error(`Elixir not found: ${elixirId}`);
    }

    const warnings: string[] = [];
    const intermediates: TransmutationResult['intermediates'] = [];
    
    let currentState: Record<string, Tensor> = { ...inputs };

    // Apply each transmutation step
    for (const step of elixir.steps) {
      const stepStartTime = Date.now();
      let result: Tensor;

      try {
        result = this.applyStep(step, currentState);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        warnings.push(`Step ${step.name} failed: ${message}`);
        throw error;
      }

      // Validate output shape if expected
      if (step.outputShape && !this.validateShape(result, step.outputShape)) {
        warnings.push(
          `Step ${step.name}: Output shape mismatch. ` +
          `Expected ${JSON.stringify(step.outputShape)}, ` +
          `got ${JSON.stringify(result.shape)}`
        );
      }

      // Record intermediate result
      intermediates.push({
        stepId: step.id,
        stepName: step.name,
        result: clone(result),
        timestamp: Date.now() - stepStartTime,
      });

      // Update state for next step
      currentState['_output'] = result;
    }

    const finalOutput = currentState['_output'];
    if (!finalOutput) {
      throw new Error('No output produced by elixir');
    }

    const executionTimeMs = Date.now() - startTime;

    const transmutationResult: TransmutationResult = {
      id: `transmutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      elixirId,
      inputs,
      output: finalOutput,
      intermediates,
      executionTimeMs,
      warnings,
      timestamp: Date.now(),
    };

    // Add to history
    this.history.push(transmutationResult);
    
    // Trim history if needed
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    return transmutationResult;
  }

  /**
   * Apply a single transmutation step.
   */
  private applyStep(
    step: TransmutationStep,
    state: Record<string, Tensor>
  ): Tensor {
    const input = state['_output'] || state[Object.keys(state)[0]];

    if (!input) {
      throw new Error(`No input tensor available for step: ${step.name}`);
    }

    // Validate input shape if expected
    if (step.inputShape && !this.validateShape(input, step.inputShape)) {
      throw new Error(
        `Step ${step.name}: Input shape mismatch. ` +
        `Expected ${JSON.stringify(step.inputShape)}, ` +
        `got ${JSON.stringify(input.shape)}`
      );
    }

    switch (step.type) {
      case 'einsum':
        if (!step.notation) {
          throw new Error(`Step ${step.name}: Missing einsum notation`);
        }
        // For einsum, we need to provide the right tensors
        // This is a simplified version - real implementation would parse notation
        return einsum(step.notation, state);

      case 'activation':
        switch (step.activation) {
          case 'sigmoid':
            return sigmoid(input);
          case 'relu':
            return relu(input);
          case 'softmax':
            return softmax(input);
          case 'threshold':
            if (step.thresholdValue === undefined) {
              throw new Error(`Step ${step.name}: Missing threshold value`);
            }
            return threshold(input, step.thresholdValue);
          default:
            throw new Error(`Unknown activation: ${step.activation}`);
        }

      case 'threshold':
        if (step.thresholdValue === undefined) {
          throw new Error(`Step ${step.name}: Missing threshold value`);
        }
        return threshold(input, step.thresholdValue);

      case 'custom':
        if (!step.customFn) {
          throw new Error(`Step ${step.name}: Missing custom function`);
        }
        return step.customFn(input);

      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Validate that a tensor has the expected shape.
   */
  private validateShape(tensor: Tensor, expectedShape: number[]): boolean {
    if (tensor.shape.length !== expectedShape.length) {
      return false;
    }
    return tensor.shape.every((dim, i) => dim === expectedShape[i]);
  }

  /**
   * Get transmutation history.
   */
  getHistory(limit?: number): TransmutationResult[] {
    if (limit) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  /**
   * Clear transmutation history.
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Create a simple MLP elixir.
   */
  static createMLPElixir(
    weights1: Tensor,
    weights2: Tensor,
    bias1?: Tensor,
    bias2?: Tensor
  ): Elixir {
    const steps: TransmutationStep[] = [
      {
        id: 'layer1',
        name: 'First Hidden Layer',
        type: 'einsum',
        notation: 'bi,ij->bj',
        outputShape: [weights1.shape[0], weights1.shape[1]],
      },
      {
        id: 'activation1',
        name: 'ReLU Activation',
        type: 'activation',
        activation: 'relu',
      },
      {
        id: 'layer2',
        name: 'Output Layer',
        type: 'einsum',
        notation: 'bj,jk->bk',
        outputShape: [weights2.shape[0], weights2.shape[1]],
      },
      {
        id: 'output_activation',
        name: 'Softmax Output',
        type: 'activation',
        activation: 'softmax',
      },
    ];

    return {
      id: 'mlp_elixir',
      name: 'Multi-Layer Perceptron',
      description: 'Two-layer MLP with ReLU hidden activation and softmax output',
      steps,
      initialState: {
        weights1,
        weights2,
        ...(bias1 && { bias1 }),
        ...(bias2 && { bias2 }),
      },
    };
  }

  /**
   * Create a simple logic programming elixir.
   */
  static createLogicElixir(rules: Tensor): Elixir {
    const steps: TransmutationStep[] = [
      {
        id: 'apply_rules',
        name: 'Apply Logic Rules',
        type: 'custom',
        customFn: (input) => {
          // For simplicity, just return the input
          // In a full implementation, this would apply actual logic rules
          return clone(input);
        },
      },
      {
        id: 'threshold',
        name: 'Boolean Threshold',
        type: 'threshold',
        thresholdValue: 0.5,
      },
    ];

    return {
      id: 'logic_elixir',
      name: 'Logic Programming',
      description: 'Apply logic rules with threshold for boolean output',
      steps,
      initialState: { rules },
    };
  }
}
