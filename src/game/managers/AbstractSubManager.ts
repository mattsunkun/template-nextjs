

export abstract class AbstractSubManager {

    public abstract updateVisualizer(): void;

    public abstract startPhaseAsync(): Promise<void>;

    public abstract endPhaseAsync(): Promise<void>;
  
  }  
