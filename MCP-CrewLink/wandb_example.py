#!/usr/bin/env python3
"""
WandB Integration Example for MCP-CrewLink

This script demonstrates how to integrate Weights & Biases (wandb) logging
into the MCP-CrewLink project for tracking system metrics and console logs.

Based on the sample code provided, this example shows:
1. Basic wandb setup and configuration
2. Simulated training metrics logging
3. Integration with the existing MCP-CrewLink workflow
"""

import random
import wandb
import os
from dotenv import load_dotenv
from wandb_tracker import WandBTracker

# Load environment variables
load_dotenv()

def run_basic_wandb_example():
    """
    Run the basic wandb example as provided by the user.
    This demonstrates the core wandb functionality.
    """
    print("🎯 Running Basic WandB Example...")
    print("=" * 50)
    
    # Start a new wandb run to track this script.
    run = wandb.init(
        # Set the wandb entity where your project will be logged (generally your team name).
        # entity=os.getenv('WANDB_ENTITY'),  # Let wandb use default user entity
        # Set the wandb project where this run will be logged.
        project="my-awesome-project",
        # Track hyperparameters and run metadata.
        config={
            "learning_rate": 0.02,
            "architecture": "CNN",
            "dataset": "CIFAR-100",
            "epochs": 10,
        },
    )
    
    print(f"✅ WandB run initialized: {run.name}")
    print(f"🔗 View run at: {run.url}")
    
    # Simulate training.
    epochs = 10
    offset = random.random() / 5
    
    print(f"\n🚀 Starting simulated training for {epochs} epochs...")
    
    for epoch in range(2, epochs):
        acc = 1 - 2**-epoch - random.random() / epoch - offset
        loss = 2**-epoch + random.random() / epoch + offset
        
        # Log metrics to wandb.
        run.log({"acc": acc, "loss": loss})
        
        print(f"Epoch {epoch}: acc={acc:.4f}, loss={loss:.4f}")
    
    print("\n✅ Training simulation completed!")
    
    # Finish the run and upload any remaining data.
    run.finish()
    print("🎯 WandB run finished!")

def run_mcp_crewlink_wandb_example():
    """
    Run the enhanced wandb example using the WandBTracker class.
    This demonstrates integration with the MCP-CrewLink project.
    """
    print("\n🎯 Running MCP-CrewLink WandB Integration Example...")
    print("=" * 60)
    
    # Configuration for the MCP-CrewLink project
    config = {
        "learning_rate": 0.02,
        "architecture": "CNN",
        "dataset": "CIFAR-100",
        "epochs": 10,
        "framework": "CrewAI",
        "mcp_version": "1.0.0",
        "project_type": "AI_Agent_Research",
        "tools_count": 3
    }
    
    # Use the WandBTracker with context manager for automatic cleanup
    with WandBTracker(
        entity=os.getenv('WANDB_ENTITY'),  # Use default user entity
        project="mcp-crewlink-demo",
        config=config
    ) as tracker:
        
        # Log system information
        print("📊 Logging system information...")
        tracker.log_system_info()
        
        # Simulate the training process
        print("🚀 Running training simulation...")
        tracker.simulate_training_metrics(epochs=10)
        
        # Simulate MCP-CrewLink specific metrics
        print("🔧 Logging MCP-CrewLink specific metrics...")
        
        # Simulate tool usage
        import time
        tools = ["file_write", "web_search", "image_generate"]
        for tool in tools:
            execution_time = random.uniform(0.5, 3.0)
            success = random.choice([True, True, True, False])  # 75% success rate
            tracker.log_tool_usage(tool, execution_time, success)
            print(f"  📝 Logged {tool} usage: {execution_time:.2f}s, success={success}")
        
        # Simulate agent performance
        agent_time = random.uniform(10.0, 30.0)
        success_rate = random.uniform(0.8, 1.0)
        tracker.log_agent_performance(
            agent_name="research_analyst",
            task_completion_time=agent_time,
            success_rate=success_rate,
            tokens_used=random.randint(1000, 5000)
        )
        print(f"  🤖 Logged agent performance: {agent_time:.2f}s, success_rate={success_rate:.2f}")
        
        # Simulate research progress
        tracker.log_research_progress(
            research_topic="Model Context Protocol Integration",
            search_queries=random.randint(3, 8),
            files_generated=random.randint(1, 3),
            images_generated=random.randint(0, 2)
        )
        print("  🔍 Logged research progress metrics")
        
        # Log some custom metrics
        custom_metrics = {
            "workflow_complexity": random.uniform(0.5, 1.0),
            "user_satisfaction": random.uniform(0.7, 1.0),
            "system_load": random.uniform(0.2, 0.8),
            "memory_usage_mb": random.randint(100, 500)
        }
        tracker.log_metrics(custom_metrics)
        print("  📈 Logged custom workflow metrics")
        
        print("\n✅ MCP-CrewLink WandB integration example completed!")
        print(f"🔗 View your run at: {tracker.run.url if tracker.run else 'N/A'}")

def main():
    """
    Main function to run both examples.
    """
    print("🌟 WandB Integration Examples for MCP-CrewLink")
    print("=" * 60)
    print("This script demonstrates two approaches to WandB integration:")
    print("1. Basic wandb usage (as provided in the example)")
    print("2. Enhanced integration with MCP-CrewLink using WandBTracker")
    print()
    
    try:
        # Run basic example
        run_basic_wandb_example()
        
        # Run enhanced example
        run_mcp_crewlink_wandb_example()
        
        print("\n🎉 All examples completed successfully!")
        print("\n💡 Next steps:")
        print("   1. Check your WandB dashboard to view the logged metrics")
        print("   2. Run the main MCP-CrewLink workflow with: python main.py")
        print("   3. Customize the WandBTracker configuration as needed")
        
    except Exception as e:
        print(f"❌ Error running examples: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure wandb is installed: pip install wandb")
        print("   2. Login to wandb: wandb login")
        print("   3. Check your .env file for WANDB_ENTITY if needed")
        print("   4. Ensure all dependencies are installed: pip install -r requirements.txt")

if __name__ == "__main__":
    main()