/**
 * REACTOR VESSEL
 * 
 * A safe, monitored execution container for tensor transformations.
 * Provides isolation, resource tracking, safety constraints, and
 * real-time monitoring of tensor operations.
 * 
 * CONCEPTUAL FRAMEWORK:
 * - **Vessel**: Isolated execution environment
 * - **Containment**: Safety boundaries and validation
 * - **Monitoring**: Real-time observation of transformations
 * - **Resources**: Tracking computational cost and memory
 * 
 * The Reactor Vessel works with the Alchemist Engine to provide
 * a complete transformation pipeline with safety guarantees.
 */

import { Tensor } from './core';
import { AlchemistEngine, Elixir, TransmutationResult } from './alchemist-engine';

/**
 * Safety constraints for reactor operations.
 */
export interface SafetyConstraints {
  /** Maximum number of tensor elements */
  maxTensorSize?: number;
  
  /** Maximum execution time in milliseconds */
  maxExecutionTimeMs?: number;
  
  /** Maximum memory usage in bytes */
  maxMemoryBytes?: number;
  
  /** Maximum number of transformation steps */
  maxSteps?: number;
  
  /** Allowed tensor data types */
  allowedDTypes?: ('boolean' | 'number')[];
}

/**
 * Resource usage metrics.
 */
export interface ResourceMetrics {
  /** Total tensor elements processed */
  tensorElements: number;
  
  /** Estimated memory usage in bytes */
  memoryBytes: number;
  
  /** Execution time in milliseconds */
  executionTimeMs: number;
  
  /** Number of operations performed */
  operationCount: number;
  
  /** Peak memory usage */
  peakMemoryBytes: number;
}

/**
 * Reactor state during execution.
 */
export type ReactorState = 
  | 'IDLE'           // Ready for operation
  | 'PREPARING'      // Loading elixir and validating
  | 'TRANSMUTING'    // Active transformation
  | 'STABILIZING'    // Post-transformation validation
  | 'COMPLETE'       // Successfully completed
  | 'ERROR'          // Error occurred
  | 'EMERGENCY_STOP'; // Emergency shutdown

/**
 * Real-time reactor status.
 */
export interface ReactorStatus {
  /** Current state */
  state: ReactorState;
  
  /** Progress (0-1) */
  progress: number;
  
  /** Current step being executed */
  currentStep?: string;
  
  /** Resource usage so far */
  resources: ResourceMetrics;
  
  /** Any warnings */
  warnings: string[];
  
  /** Timestamp of last update */
  lastUpdate: number;
}

/**
 * Event emitted by the reactor.
 */
export interface ReactorEvent {
  /** Event type */
  type: 'state_change' | 'progress' | 'warning' | 'step_complete' | 'complete' | 'error';
  
  /** Event data */
  data: unknown;
  
  /** Timestamp */
  timestamp: number;
}

/**
 * Callback for reactor events.
 */
export type ReactorEventCallback = (event: ReactorEvent) => void;

/**
 * The Reactor Vessel provides safe, monitored tensor transformations.
 */
export class ReactorVessel {
  private engine: AlchemistEngine;
  private constraints: SafetyConstraints;
  private status: ReactorStatus;
  private eventCallbacks: Set<ReactorEventCallback> = new Set();
  private abortController?: AbortController;

  constructor(
    engine: AlchemistEngine,
    constraints: SafetyConstraints = {}
  ) {
    this.engine = engine;
    this.constraints = {
      maxTensorSize: constraints.maxTensorSize || 1_000_000,
      maxExecutionTimeMs: constraints.maxExecutionTimeMs || 30_000,
      maxMemoryBytes: constraints.maxMemoryBytes || 100_000_000,
      maxSteps: constraints.maxSteps || 100,
      allowedDTypes: constraints.allowedDTypes || ['boolean', 'number'],
    };

    this.status = {
      state: 'IDLE',
      progress: 0,
      resources: {
        tensorElements: 0,
        memoryBytes: 0,
        executionTimeMs: 0,
        operationCount: 0,
        peakMemoryBytes: 0,
      },
      warnings: [],
      lastUpdate: Date.now(),
    };
  }

  /**
   * Subscribe to reactor events.
   */
  on(callback: ReactorEventCallback): () => void {
    this.eventCallbacks.add(callback);
    return () => this.eventCallbacks.delete(callback);
  }

  /**
   * Emit a reactor event.
   */
  private emit(type: ReactorEvent['type'], data: unknown): void {
    const event: ReactorEvent = {
      type,
      data,
      timestamp: Date.now(),
    };
    
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in reactor event callback:', error);
      }
    });
  }

  /**
   * Update reactor state.
   */
  private setState(state: ReactorState): void {
    this.status.state = state;
    this.status.lastUpdate = Date.now();
    this.emit('state_change', { state });
  }

  /**
   * Update progress.
   */
  private setProgress(progress: number, currentStep?: string): void {
    this.status.progress = Math.max(0, Math.min(1, progress));
    this.status.currentStep = currentStep;
    this.status.lastUpdate = Date.now();
    this.emit('progress', { progress, currentStep });
  }

  /**
   * Add a warning.
   */
  private addWarning(message: string): void {
    this.status.warnings.push(message);
    this.emit('warning', { message });
  }

  /**
   * Validate tensor against safety constraints.
   */
  private validateTensor(tensor: Tensor, name: string): void {
    const size = tensor.data.length;
    
    if (this.constraints.maxTensorSize && size > this.constraints.maxTensorSize) {
      throw new Error(
        `Tensor ${name} exceeds maximum size: ${size} > ${this.constraints.maxTensorSize}`
      );
    }

    const memoryBytes = size * 8; // Approximate: 8 bytes per number
    if (this.constraints.maxMemoryBytes && memoryBytes > this.constraints.maxMemoryBytes) {
      throw new Error(
        `Tensor ${name} exceeds memory limit: ${memoryBytes} > ${this.constraints.maxMemoryBytes}`
      );
    }
  }

  /**
   * Validate elixir against safety constraints.
   */
  private validateElixir(elixir: Elixir): void {
    if (this.constraints.maxSteps && elixir.steps.length > this.constraints.maxSteps) {
      throw new Error(
        `Elixir ${elixir.name} exceeds maximum steps: ${elixir.steps.length} > ${this.constraints.maxSteps}`
      );
    }
  }

  /**
   * Update resource metrics.
   */
  private updateResources(tensor: Tensor, startTime: number): void {
    const elements = tensor.data.length;
    const memoryBytes = elements * 8;
    
    this.status.resources.tensorElements += elements;
    this.status.resources.memoryBytes += memoryBytes;
    this.status.resources.operationCount += 1;
    this.status.resources.executionTimeMs = Date.now() - startTime;
    
    if (memoryBytes > this.status.resources.peakMemoryBytes) {
      this.status.resources.peakMemoryBytes = memoryBytes;
    }
  }

  /**
   * Execute a transmutation in the reactor vessel.
   */
  async execute(
    elixirId: string,
    inputs: Record<string, Tensor>
  ): Promise<TransmutationResult> {
    // Reset state
    this.status = {
      state: 'IDLE',
      progress: 0,
      resources: {
        tensorElements: 0,
        memoryBytes: 0,
        executionTimeMs: 0,
        operationCount: 0,
        peakMemoryBytes: 0,
      },
      warnings: [],
      lastUpdate: Date.now(),
    };

    const startTime = Date.now();
    this.abortController = new AbortController();

    try {
      // PREPARATION PHASE
      this.setState('PREPARING');
      
      const elixir = this.engine.getElixir(elixirId);
      if (!elixir) {
        throw new Error(`Elixir not found: ${elixirId}`);
      }

      // Validate elixir
      this.validateElixir(elixir);
      
      // Validate inputs
      for (const [name, tensor] of Object.entries(inputs)) {
        this.validateTensor(tensor, name);
      }

      this.setProgress(0.1, 'Validation complete');

      // TRANSMUTATION PHASE
      this.setState('TRANSMUTING');
      
      // Execute with timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Execution timeout exceeded'));
        }, this.constraints.maxExecutionTimeMs);
      });

      const executionPromise = new Promise<TransmutationResult>((resolve) => {
        const result = this.engine.transmute(elixirId, inputs);
        
        // Update progress as we go through steps
        result.intermediates.forEach((intermediate, index) => {
          const progress = 0.1 + (0.8 * (index + 1) / result.intermediates.length);
          this.setProgress(progress, intermediate.stepName);
          this.updateResources(intermediate.result, startTime);
          
          this.emit('step_complete', {
            step: intermediate.stepName,
            shape: intermediate.result.shape,
          });
        });

        resolve(result);
      });

      const result = await Promise.race([executionPromise, timeoutPromise]);

      // STABILIZATION PHASE
      this.setState('STABILIZING');
      this.setProgress(0.95, 'Validating output');
      
      // Validate output
      this.validateTensor(result.output, 'output');
      
      // Check for warnings from engine
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => this.addWarning(warning));
      }

      // COMPLETION
      this.setState('COMPLETE');
      this.setProgress(1.0);
      
      this.emit('complete', {
        result,
        resources: this.status.resources,
      });

      return result;

    } catch (error) {
      this.setState('ERROR');
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.emit('error', { message, error });
      throw error;
    }
  }

  /**
   * Emergency stop the reactor.
   */
  emergencyStop(): void {
    this.setState('EMERGENCY_STOP');
    if (this.abortController) {
      this.abortController.abort();
    }
    this.emit('error', { message: 'Emergency stop activated' });
  }

  /**
   * Get current reactor status.
   */
  getStatus(): ReactorStatus {
    return { ...this.status };
  }

  /**
   * Reset reactor to idle state.
   */
  reset(): void {
    this.setState('IDLE');
    this.status.progress = 0;
    this.status.currentStep = undefined;
    this.status.warnings = [];
    this.status.resources = {
      tensorElements: 0,
      memoryBytes: 0,
      executionTimeMs: 0,
      operationCount: 0,
      peakMemoryBytes: 0,
    };
  }

  /**
   * Get a summary report of the last execution.
   */
  getSummaryReport(): string {
    const { state, resources, warnings } = this.status;
    
    return `
REACTOR VESSEL SUMMARY
=====================
State: ${state}
Execution Time: ${resources.executionTimeMs}ms
Operations: ${resources.operationCount}
Tensor Elements: ${resources.tensorElements.toLocaleString()}
Memory Used: ${(resources.memoryBytes / 1024 / 1024).toFixed(2)} MB
Peak Memory: ${(resources.peakMemoryBytes / 1024 / 1024).toFixed(2)} MB
Warnings: ${warnings.length}
${warnings.length > 0 ? '\n' + warnings.map(w => `  - ${w}`).join('\n') : ''}
    `.trim();
  }
}
