import random
import wandb
import os
from typing import Dict, Any, Optional
from datetime import datetime

class WandBTracker:
    """
    A modular Weights & Biases tracker for logging system metrics and console logs.
    Integrates seamlessly with the MCP-CrewLink project.
    """
    
    def __init__(self, 
                 entity: Optional[str] = None,
                 project: str = "demo",
                 config: Optional[Dict[str, Any]] = None,
                 auto_init: bool = True):
        """
        Initialize the WandB tracker.
        
        Args:
            entity: WandB entity (team name)
            project: WandB project name
            config: Configuration dictionary for hyperparameters
            auto_init: Whether to automatically initialize wandb run
        """
        self.entity = entity or os.getenv('WANDB_ENTITY')  # Let wandb use default user entity if not specified
        self.project = project
        self.config = config or self._get_default_config()
        self.run = None
        self.is_initialized = False
        
        if auto_init:
            self.initialize_run()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration for the tracking run."""
        return {
            "framework": "CrewAI",
            "mcp_version": "1.0.0",
            "project_type": "AI_Agent_Research",
            "tools_count": 3,  # FileWrite, WebSearch, ImageGenerate
            "timestamp": datetime.now().isoformat(),
            "environment": "development"
        }
    
    def initialize_run(self, run_name: Optional[str] = None) -> None:
        """Initialize a new wandb run."""
        try:
            self.run = wandb.init(
                entity=self.entity,
                project=self.project,
                name=run_name,
                config=self.config,
                reinit=True  # Allow multiple runs in same process
            )
            self.is_initialized = True
            print(f"✅ WandB run initialized: {self.run.name}")
            print(f"🔗 View run at: {self.run.url}")
        except Exception as e:
            print(f"❌ Failed to initialize WandB: {str(e)}")
            self.is_initialized = False
    
    def log_metrics(self, metrics: Dict[str, Any], step: Optional[int] = None) -> None:
        """Log metrics to wandb."""
        if not self.is_initialized or not self.run:
            print("⚠️ WandB not initialized. Skipping metric logging.")
            return
        
        try:
            self.run.log(metrics, step=step)
        except Exception as e:
            print(f"❌ Failed to log metrics: {str(e)}")
    
    def log_agent_performance(self, 
                            agent_name: str,
                            task_completion_time: float,
                            success_rate: float,
                            tokens_used: Optional[int] = None) -> None:
        """Log agent-specific performance metrics."""
        metrics = {
            f"{agent_name}_completion_time": task_completion_time,
            f"{agent_name}_success_rate": success_rate,
        }
        
        if tokens_used:
            metrics[f"{agent_name}_tokens_used"] = tokens_used
        
        self.log_metrics(metrics)
    
    def log_tool_usage(self, tool_name: str, execution_time: float, success: bool) -> None:
        """Log tool usage statistics."""
        metrics = {
            f"tool_{tool_name}_execution_time": execution_time,
            f"tool_{tool_name}_success": 1 if success else 0,
            "total_tool_calls": 1
        }
        self.log_metrics(metrics)
    
    def log_research_progress(self, 
                            research_topic: str,
                            search_queries: int,
                            files_generated: int,
                            images_generated: int) -> None:
        """Log research-specific progress metrics."""
        metrics = {
            "search_queries_count": search_queries,
            "files_generated_count": files_generated,
            "images_generated_count": images_generated,
            "research_topic_length": len(research_topic)
        }
        self.log_metrics(metrics)
    
    def simulate_training_metrics(self, epochs: int = 10) -> None:
        """Simulate training metrics similar to the provided example."""
        if not self.is_initialized:
            print("⚠️ WandB not initialized. Cannot simulate training.")
            return
        
        print(f"🚀 Starting simulated training for {epochs} epochs...")
        
        offset = random.random() / 5
        for epoch in range(2, epochs):
            acc = 1 - 2**-epoch - random.random() / epoch - offset
            loss = 2**-epoch + random.random() / epoch + offset
            
            # Log metrics to wandb
            self.log_metrics({
                "epoch": epoch,
                "accuracy": acc,
                "loss": loss,
                "learning_rate": self.config.get("learning_rate", 0.02)
            })
            
            print(f"Epoch {epoch}: acc={acc:.4f}, loss={loss:.4f}")
    
    def log_system_info(self) -> None:
        """Log system information and environment details."""
        import platform
        import psutil
        
        system_metrics = {
            "system_platform": platform.system(),
            "python_version": platform.python_version(),
            "cpu_count": psutil.cpu_count(),
            "memory_total_gb": psutil.virtual_memory().total / (1024**3),
            "disk_usage_percent": psutil.disk_usage('/').percent
        }
        
        self.log_metrics(system_metrics)
        print("📊 System information logged to WandB")
    
    def finish_run(self) -> None:
        """Finish the wandb run and upload any remaining data."""
        if self.run and self.is_initialized:
            try:
                self.run.finish()
                print("✅ WandB run finished successfully")
                self.is_initialized = False
            except Exception as e:
                print(f"❌ Error finishing WandB run: {str(e)}")
        else:
            print("⚠️ No active WandB run to finish")
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - automatically finish run."""
        self.finish_run()


# Example usage and testing function
def run_wandb_example():
    """Run the example from the user's request."""
    print("🎯 Running WandB integration example...")
    
    # Create tracker with custom config
    config = {
        "learning_rate": 0.02,
        "architecture": "CNN",
        "dataset": "CIFAR-100",
        "epochs": 10,
    }
    
    with WandBTracker(project="demo", config=config) as tracker:
        # Log system information
        tracker.log_system_info()
        
        # Simulate training as per the example
        tracker.simulate_training_metrics(epochs=10)
        
        # Log some additional MCP-specific metrics
        tracker.log_research_progress(
            research_topic="Model Context Protocol",
            search_queries=3,
            files_generated=1,
            images_generated=1
        )
        
        print("🎉 Example completed successfully!")


if __name__ == "__main__":
    run_wandb_example()