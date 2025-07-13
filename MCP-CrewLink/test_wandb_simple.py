#!/usr/bin/env python3
"""
Simple WandB Integration Test

This script tests the basic WandB functionality without entity permissions.
"""

import random
import wandb
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_basic_wandb():
    """
    Test basic wandb functionality without entity specification.
    """
    print("🎯 Testing Basic WandB Integration...")
    
    try:
        # Start a new wandb run without specifying entity
        run = wandb.init(
            project="mcp-crewlink-test",
            config={
                "learning_rate": 0.02,
                "architecture": "CNN",
                "dataset": "CIFAR-100",
                "epochs": 10,
            },
        )
        
        print(f"✅ WandB run initialized: {run.name}")
        print(f"🔗 View run at: {run.url}")
        
        # Simulate training for a few epochs
        epochs = 5
        offset = random.random() / 5
        
        print(f"\n🚀 Logging metrics for {epochs} epochs...")
        
        for epoch in range(2, epochs):
            acc = 1 - 2**-epoch - random.random() / epoch - offset
            loss = 2**-epoch + random.random() / epoch + offset
            
            # Log metrics to wandb
            run.log({"acc": acc, "loss": loss, "epoch": epoch})
            print(f"Epoch {epoch}: acc={acc:.4f}, loss={loss:.4f}")
        
        # Log some additional metrics
        run.log({
            "final_accuracy": 0.95,
            "total_epochs": epochs,
            "model_size": 1024,
            "training_time": 120.5
        })
        
        print("\n✅ Metrics logged successfully!")
        
        # Finish the run
        run.finish()
        print("🎯 WandB run finished successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_wandb_tracker():
    """
    Test the WandBTracker class.
    """
    print("\n🎯 Testing WandBTracker Class...")
    
    try:
        from wandb_tracker import WandBTracker
        
        config = {
            "framework": "CrewAI",
            "test_mode": True,
            "version": "1.0.0"
        }
        
        with WandBTracker(project="mcp-crewlink-tracker-test", config=config) as tracker:
            print("✅ WandBTracker initialized successfully")
            
            # Test logging various metrics
            tracker.log_metrics({
                "test_metric": 0.85,
                "processing_time": 2.5,
                "success_rate": 1.0
            })
            
            # Test tool usage logging
            tracker.log_tool_usage("test_tool", 1.2, True)
            
            # Test agent performance logging
            tracker.log_agent_performance(
                agent_name="test_agent",
                task_completion_time=5.0,
                success_rate=0.95
            )
            
            print("✅ All tracker methods tested successfully")
        
        print("🎯 WandBTracker test completed!")
        return True
        
    except Exception as e:
        print(f"❌ WandBTracker error: {str(e)}")
        return False

def main():
    """
    Run all tests.
    """
    print("🧪 WandB Integration Tests")
    print("=" * 40)
    
    # Test basic wandb
    basic_success = test_basic_wandb()
    
    # Test WandBTracker
    tracker_success = test_wandb_tracker()
    
    print("\n📊 Test Results:")
    print(f"   Basic WandB: {'✅ PASS' if basic_success else '❌ FAIL'}")
    print(f"   WandBTracker: {'✅ PASS' if tracker_success else '❌ FAIL'}")
    
    if basic_success and tracker_success:
        print("\n🎉 All tests passed! WandB integration is working correctly.")
        print("\n💡 Next steps:")
        print("   1. Run the main workflow: python main.py")
        print("   2. Check your WandB dashboard for logged metrics")
        print("   3. Customize the configuration as needed")
    else:
        print("\n⚠️ Some tests failed. Check the error messages above.")
        print("\n🔧 Troubleshooting:")
        print("   1. Ensure wandb is installed: pip install wandb")
        print("   2. Login to wandb: wandb login")
        print("   3. Check internet connection")
        print("   4. Install dependencies: pip install -r requirements.txt")

if __name__ == "__main__":
    main()