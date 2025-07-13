#!/usr/bin/env python3
"""
W&B Inference API Integration Example with CrewAI

This example demonstrates how to use Weights & Biases Inference API
with CrewAI agents for enhanced LLM capabilities.
"""

import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, LLM
from crewai.tools import BaseTool
from typing import Type, Any
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()

class SimpleResearchTool(BaseTool):
    """A simple research tool for demonstration."""
    name: str = "simple_research"
    description: str = "Performs simple research on a given topic"
    
    class SimpleResearchInput(BaseModel):
        topic: str = Field(..., description="The topic to research")
    
    args_schema: Type[BaseModel] = SimpleResearchInput
    
    def _run(self, topic: str) -> str:
        """Execute the research."""
        return f"Research findings for '{topic}': This is a simulated research result with key insights and important information about the topic."

def configure_wandb_inference_llm():
    """
    Configure LLM for W&B Inference API with required extra_headers.
    Returns None if W&B Inference is not configured.
    """
    wandb_api_key = os.getenv('WANDB_INFERENCE_API_KEY')
    wandb_model = os.getenv('WANDB_INFERENCE_MODEL', 'openai/meta-llama/Llama-4-Scout-17B-16E-Instruct')
    wandb_project = os.getenv('WANDB_INFERENCE_PROJECT', 'crewai/pop_smoke')
    
    if not wandb_api_key:
        print("⚠️ WANDB_INFERENCE_API_KEY not found. Using default LLM configuration.")
        return None
    
    try:
        llm = LLM(
            model=wandb_model,
            api_base="https://api.inference.wandb.ai/v1",
            api_key=wandb_api_key,
            extra_headers={"OpenAI-Project": wandb_project},
        )
        print(f"✅ W&B Inference LLM configured: {wandb_model}")
        print(f"🔗 Project: {wandb_project}")
        return llm
    except Exception as e:
        print(f"❌ Failed to configure W&B Inference LLM: {str(e)}")
        return None

def main():
    """Main function to demonstrate W&B Inference API integration."""
    print("🚀 W&B Inference API + CrewAI Integration Example")
    print("=" * 50)
    
    # Configure W&B Inference LLM
    wandb_llm = configure_wandb_inference_llm()
    
    # Initialize tools
    tools = [SimpleResearchTool()]
    
    # Create agent configuration
    agent_config = {
        "role": "AI Research Assistant",
        "goal": "Conduct research and provide insightful analysis on various topics",
        "backstory": "You are an expert AI research assistant with access to advanced language models through W&B Inference API.",
        "tools": tools,
        "verbose": True,
    }
    
    # Add LLM configuration if W&B Inference is available
    if wandb_llm:
        agent_config["llm"] = wandb_llm
        print("🤖 Agent configured with W&B Inference LLM")
    else:
        print("🤖 Agent using default LLM configuration")
    
    # Create agent
    agent = Agent(**agent_config)
    
    # Define research task
    research_topic = "Artificial Intelligence in Healthcare"
    task = Task(
        description=f"""Research the topic '{research_topic}' and provide a comprehensive analysis including:
        1. Current applications and use cases
        2. Benefits and challenges
        3. Future prospects
        
        Use the research tool to gather information and provide detailed insights.""",
        expected_output="A comprehensive research analysis with key findings and insights.",
        agent=agent,
    )
    
    # Create crew
    crew = Crew(
        agents=[agent],
        tasks=[task],
        verbose=True,
    )
    
    # Execute the research
    print(f"\n📊 Starting research on: {research_topic}")
    print("-" * 40)
    
    try:
        result = crew.kickoff()
        print("\n✅ Research completed successfully!")
        print("=" * 50)
        print("📋 Research Results:")
        print(result)
        
        # Display configuration summary
        print("\n🔧 Configuration Summary:")
        print(f"   • LLM: {'W&B Inference API' if wandb_llm else 'Default CrewAI LLM'}")
        if wandb_llm:
            print(f"   • Model: {os.getenv('WANDB_INFERENCE_MODEL', 'openai/meta-llama/Llama-4-Scout-17B-16E-Instruct')}")
            print(f"   • Project: {os.getenv('WANDB_INFERENCE_PROJECT', 'crewai/pop_smoke')}")
        print(f"   • Tools: {len(tools)} available")
        
    except Exception as e:
        print(f"❌ Error during research execution: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎉 W&B Inference API integration example completed successfully!")
    else:
        print("\n💥 Example execution failed. Please check your configuration.")