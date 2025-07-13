import warnings
import os
import asyncio
import time
from dotenv import load_dotenv
from pydantic import PydanticDeprecatedSince20
from mcp.client.stdio import StdioServerParameters, stdio_client
from crewai import Agent, Task, Crew, LLM
from crewai.tools import BaseTool
from typing import Type, Any, Dict
from pydantic import BaseModel, Field
from wandb_tracker import WandBTracker

# Load environment variables from .env file
load_dotenv()

# Suppress Pydantic deprecation warnings
warnings.filterwarnings("ignore", category=PydanticDeprecatedSince20)

# Create a local files directory if it doesn't exist
files_dir = os.path.join(os.getcwd(), "files")
os.makedirs(files_dir, exist_ok=True)

# Filesystem server configuration
server_params = StdioServerParameters(
    command="npx",
    args=[
        "-y",
        "@modelcontextprotocol/server-filesystem",
        files_dir,
    ]
)

# EXA Search server configuration
exa_search_params = StdioServerParameters(
    command="npx",
    args=[
         "-y",
        "mcp-remote",
        "https://mcp.exa.ai/mcp?exaApiKey=8315fda2-c304-4563-800a-53888dff7683"
    ],
)

# Image server configuration
image_server_env = {"OPENAI_API_KEY": os.getenv("OPENAI_API_KEY")}
if os.getenv("OPENAI_ORGANIZATION"):
    image_server_env["OPENAI_ORGANIZATION"] = os.getenv("OPENAI_ORGANIZATION")

image_server_params = StdioServerParameters(
    command="python3",
    args=[
        "servers/image_server.py",
    ],
    env=image_server_env
)

# Custom MCP Tools for CrewAI
class FileWriteInput(BaseModel):
    filename: str = Field(description="Name of the file to write")
    content: str = Field(description="Content to write to the file")

class FileWriteTool(BaseTool):
    name: str = "write_file"
    description: str = "Write content to a file in the files directory"
    args_schema: Type[BaseModel] = FileWriteInput
    wandb_tracker: Any = None
    
    def __init__(self, wandb_tracker=None, **kwargs):
        super().__init__(**kwargs)
        self.wandb_tracker = wandb_tracker
    
    def _run(self, filename: str, content: str) -> str:
        start_time = time.time()
        success = False
        try:
            file_path = os.path.join(files_dir, filename)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            success = True
            result = f"Successfully wrote content to {filename}"
        except Exception as e:
            result = f"Error writing file: {str(e)}"
        finally:
            execution_time = time.time() - start_time
            if self.wandb_tracker:
                self.wandb_tracker.log_tool_usage("file_write", execution_time, success)
        return result

class WebSearchInput(BaseModel):
    query: str = Field(description="Search query to execute")

class WebSearchTool(BaseTool):
    name: str = "web_search"
    description: str = "Search the web using EXA Search API"
    args_schema: Type[BaseModel] = WebSearchInput
    wandb_tracker: Any = None
    
    def __init__(self, wandb_tracker=None, **kwargs):
        super().__init__(**kwargs)
        self.wandb_tracker = wandb_tracker
    
    def _run(self, query: str) -> str:
        start_time = time.time()
        success = False
        try:
            import requests
            
            # Use EXA Search API directly
            api_key = os.getenv('BRAVE_API_KEY')
            if not api_key:
                return f"Brave API key not found. Please set BRAVE_API_KEY in your .env file."
            
            headers = {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'X-Subscription-Token': api_key
            }
            
            params = {
                'q': query,
                'count': 5
            }
            
            response = requests.get(
                'https://api.search.brave.com/res/v1/web/search',
                headers=headers,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                results = []
                
                if 'web' in data and 'results' in data['web']:
                    for result in data['web']['results'][:3]:  # Top 3 results
                        title = result.get('title', 'No title')
                        description = result.get('description', 'No description')
                        url = result.get('url', 'No URL')
                        results.append(f"**{title}**\n{description}\nURL: {url}\n")
                
                if results:
                    success = True
                    result = f"Search results for '{query}':\n\n" + "\n".join(results)
                else:
                    success = True
                    result = f"No results found for '{query}'"
            else:
                result = f"Search API error: {response.status_code} - {response.text}"
                
        except Exception as e:
            result = f"Error performing web search: {str(e)}"
        finally:
            execution_time = time.time() - start_time
            if self.wandb_tracker:
                self.wandb_tracker.log_tool_usage("web_search", execution_time, success)
        return result

class ImageGenerateInput(BaseModel):
    prompt: str = Field(description="Description of the image to generate")
    filename: str = Field(description="Name for the generated image file")

class ImageGenerateTool(BaseTool):
    name: str = "generate_image"
    description: str = "Generate an image using OpenAI DALL-E"
    args_schema: Type[BaseModel] = ImageGenerateInput
    wandb_tracker: Any = None
    
    def __init__(self, wandb_tracker=None, **kwargs):
        super().__init__(**kwargs)
        self.wandb_tracker = wandb_tracker
    
    def _run(self, prompt: str, filename: str) -> str:
        start_time = time.time()
        success = False
        try:
            from openai import OpenAI
            import base64
            
            # Create images directory if it doesn't exist
            images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
            os.makedirs(images_dir, exist_ok=True)
            
            # Initialize OpenAI client directly
            client = OpenAI(
                api_key=os.getenv("OPENAI_API_KEY"),
                organization=os.getenv("OPENAI_ORGANIZATION")
            )
            
            # Generate image
            result = client.images.generate(
                model="dall-e-3",
                prompt=f"Generate an image based on the following prompt: {prompt}",
                size="1024x1024",
                quality="hd",
                response_format="b64_json"
            )
            
            # Extract base64 image data and save
            image_base64 = result.data[0].b64_json
            image_bytes = base64.b64decode(image_base64)
            
            file_path = os.path.join(images_dir, f"{filename}.png")
            with open(file_path, "wb") as f:
                f.write(image_bytes)
            
            success = True
            result = f"Successfully generated and saved image '{filename}.png' in images directory with prompt: {prompt}"
            
        except Exception as e:
            result = f"Error generating image: {str(e)}"
        finally:
            execution_time = time.time() - start_time
            if self.wandb_tracker:
                self.wandb_tracker.log_tool_usage("image_generate", execution_time, success)
        return result

# Initialize WandB tracker
wandb_tracker = None

# Cleanup function to remove old files and images
def cleanup_old_files():
    """
    Remove all existing files and images from previous runs to ensure
    only the latest generated content is available.
    """
    files_removed = 0
    images_removed = 0
    
    # Clean up files directory
    if os.path.exists(files_dir):
        for filename in os.listdir(files_dir):
            if filename.endswith(('.txt', '.md', '.json')):
                file_path = os.path.join(files_dir, filename)
                try:
                    os.remove(file_path)
                    files_removed += 1
                    print(f"🗑️ Removed old file: {filename}")
                except Exception as e:
                    print(f"❌ Error removing file {filename}: {e}")
    
    # Clean up images directory
    images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
    if os.path.exists(images_dir):
        for filename in os.listdir(images_dir):
            if filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
                image_path = os.path.join(images_dir, filename)
                try:
                    os.remove(image_path)
                    images_removed += 1
                    print(f"🗑️ Removed old image: {filename}")
                except Exception as e:
                    print(f"❌ Error removing image {filename}: {e}")
    
    print(f"✅ Cleanup completed: {files_removed} files and {images_removed} images removed")
    return files_removed, images_removed

# Format content for rich text display
def format_content_for_display(content):
    """
    Format content for rich text display with proper formatting.
    """
    # Add basic HTML-like formatting for better display
    formatted = content.replace('\n\n', '</p><p>')
    formatted = formatted.replace('\n', '<br>')
    
    # Format headers (lines that end with colon or are all caps)
    lines = content.split('\n')
    formatted_lines = []
    
    for line in lines:
        stripped = line.strip()
        if stripped:
            # Check if line is a header (ends with colon, starts with #, or is all caps)
            if (stripped.endswith(':') and len(stripped) < 100) or \
               stripped.startswith('#') or \
               (stripped.isupper() and len(stripped.split()) <= 10 and len(stripped) < 50):
                formatted_lines.append(f'<h3 style="color: #2563eb; font-weight: bold; margin: 16px 0 8px 0;">{stripped}</h3>')
            # Check for bullet points
            elif stripped.startswith(('- ', '• ', '* ')):
                formatted_lines.append(f'<li style="margin: 4px 0;">{stripped[2:]}</li>')
            # Check for numbered lists
            elif any(stripped.startswith(f'{i}.') for i in range(1, 20)):
                formatted_lines.append(f'<li style="margin: 4px 0;">{stripped}</li>')
            else:
                formatted_lines.append(f'<p style="margin: 8px 0; line-height: 1.6;">{stripped}</p>')
        else:
            formatted_lines.append('<br>')
    
    # Wrap lists in proper ul tags
    result = '\n'.join(formatted_lines)
    result = result.replace('<li', '<ul><li').replace('</li>\n<p', '</li></ul>\n<p')
    result = result.replace('</li>\n<br>', '</li></ul>\n<br>')
    
    return f'<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">{result}</div>'

# Initialize tools with WandB tracking
def initialize_tools_with_tracking(tracker=None):
    return [
        FileWriteTool(wandb_tracker=tracker),
        WebSearchTool(wandb_tracker=tracker),
        ImageGenerateTool(wandb_tracker=tracker)
    ]

# Configure W&B Inference LLM
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

# Example usage
if __name__ == "__main__":
    import sys
    import json
    
    # Get research topic and query from environment variables or use defaults
    research_topic = os.getenv('RESEARCH_TOPIC', 'Model Context Protocol')
    research_query = os.getenv('RESEARCH_QUERY', 'How does MCP work and what are its key components?')
    
    # Clean up old files and images before starting new research
    print("🧹 Cleaning up old files and images...")
    cleanup_old_files()
    
    # Initialize WandB tracking
    wandb_config = {
        "research_topic": research_topic,
        "research_query": research_query,
        "framework": "CrewAI",
        "mcp_version": "1.0.0",
        "tools_count": 3,
        "project_type": "AI_Agent_Research"
    }
    
    # Create WandB tracker
    wandb_tracker = WandBTracker(
        project="mcp-crewlink-research",
        config=wandb_config,
        auto_init=True
    )
    
    # Initialize tools with tracking
    tools = initialize_tools_with_tracking(wandb_tracker)
    
    print("Server parameters configured successfully")
    print(f"Filesystem server: {server_params}")
    print(f"EXA Search server: {exa_search_params}")
    print(f"Image server: {image_server_params}")
    print(f"\nInitialized {len(tools)} MCP tools with WandB tracking")
    print(f"Research Topic: {research_topic}")
    print(f"Research Query: {research_query}")
    
    # Log system information
    wandb_tracker.log_system_info()
    
    # Configure W&B Inference LLM if available
    wandb_llm = configure_wandb_inference_llm()
    
    # Create research agent with optional W&B Inference LLM
    agent_config = {
        "role": "Research Analyst",
        "goal": f"Research and analyze information about {research_topic} and provide comprehensive insights.",
        "backstory": "An expert research analyst who can search the web, analyze information, and create visual diagrams to explain complex topics.",
        "tools": tools,
        "verbose": True,
    }
    
    # Add LLM configuration if W&B Inference is available
    if wandb_llm:
        agent_config["llm"] = wandb_llm
        print("🤖 Agent configured with W&B Inference LLM")
    else:
        print("🤖 Agent using default LLM configuration")
    
    agent = Agent(**agent_config)
    
    # Research task
    research_task = Task(
        description=f"""Conduct comprehensive research on '{research_topic}' with focus on: {research_query}
        
        1. Perform multiple web searches to gather comprehensive, up-to-date information
        2. Research current trends, market analysis, and recent developments
        3. Identify key concepts, definitions, and technical details
        4. Find practical applications, use cases, and real-world examples
        5. Discover challenges, limitations, and potential solutions
        6. Create a detailed diagram that visually explains the key concepts and relationships
        7. Gather information about future implications and predictions
        
        Focus on collecting detailed, accurate, and current information that will be used to create a comprehensive markdown report. Use multiple search queries to cover different aspects of the topic thoroughly.""",
        expected_output="Comprehensive research findings with detailed information, current trends, and a visual diagram ready for report generation.",
        agent=agent,
    )
    
    # Summary task
    summary_task = Task(
        description=f"""Create a detailed markdown report about {research_topic} based on the research findings.
        
        Save the report as a markdown file in the files directory with filename: {research_topic.lower().replace(' ', '_')}_detailed_report.md
        
        Format the report with proper markdown syntax including:
        - # Main title with the research topic
        - ## Section headers for different aspects
        - ### Subsection headers for detailed breakdowns
        - **Bold text** for key terms and important points
        - *Italic text* for emphasis
        - Bullet points (-) for lists
        - Numbered lists (1.) for sequential information
        - Code blocks (```) for technical details if applicable
        - > Blockquotes for important quotes or findings
        - Tables if data comparison is needed
        - Links to sources in [text](url) format
        
        Include comprehensive sections:
        - Executive Summary
        - Key Findings from Web Research
        - Detailed Concepts and Definitions
        - Technical Implementation (if applicable)
        - Practical Applications and Use Cases
        - Current Trends and Market Analysis
        - Challenges and Limitations
        - Future Implications and Predictions
        - Recommendations
        - Conclusion
        - References and Sources
        
        Make the report detailed, well-structured, and professionally formatted for easy reading.""",
        expected_output="A comprehensive detailed markdown report saved as an .md file with rich formatting.",
        agent=agent,
    )
    
    crew = Crew(
        agents=[agent],
        tasks=[research_task, summary_task],
        verbose=True,
    )
    
    # Track crew execution time
    crew_start_time = time.time()
    print("\n🚀 Starting CrewAI research workflow...")
    
    result = crew.kickoff()
    
    crew_execution_time = time.time() - crew_start_time
    
    # Log agent performance metrics
    wandb_tracker.log_agent_performance(
        agent_name="research_analyst",
        task_completion_time=crew_execution_time,
        success_rate=1.0 if result else 0.0
    )
    
    # Output structured results for the API
    output_data = {
        "success": True,
        "research_topic": research_topic,
        "research_query": research_query,
        "crew_result": str(result),
        "files_generated": [],
        "images_generated": []
    }
    
    # Check for generated files
    if os.path.exists(files_dir):
        for filename in os.listdir(files_dir):
            if filename.endswith(('.txt', '.md')):
                file_path = os.path.join(files_dir, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    output_data["files_generated"].append({
                        "filename": filename,
                        "content": content,
                        "path": file_path,
                        "file_type": "markdown" if filename.endswith('.md') else "text",
                        "formatted_content": format_content_for_display(content)
                    })
                except Exception as e:
                    print(f"Error reading file {filename}: {e}")
    
    # Check for generated images
    images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
    if os.path.exists(images_dir):
        for filename in os.listdir(images_dir):
            if filename.endswith('.png'):
                image_path = os.path.join(images_dir, filename)
                try:
                    import base64
                    with open(image_path, 'rb') as f:
                        image_data = f.read()
                    image_base64 = base64.b64encode(image_data).decode('utf-8')
                    output_data["images_generated"].append({
                        "filename": filename,
                        "base64": image_base64,
                        "path": image_path
                    })
                except Exception as e:
                    print(f"Error reading image {filename}: {e}")
    
    # Log research progress metrics
    search_queries_count = len([task for task in [research_task, summary_task] if 'search' in task.description.lower()])
    wandb_tracker.log_research_progress(
        research_topic=research_topic,
        search_queries=search_queries_count,
        files_generated=len(output_data['files_generated']),
        images_generated=len(output_data['images_generated'])
    )
    
    # Log final metrics
    final_metrics = {
        "total_execution_time": crew_execution_time,
        "files_generated_count": len(output_data['files_generated']),
        "images_generated_count": len(output_data['images_generated']),
        "workflow_success": True
    }
    wandb_tracker.log_metrics(final_metrics)
    
    # Print structured output for API consumption
    print("\n=== STRUCTURED_OUTPUT_START ===")
    print(json.dumps(output_data, indent=2))
    print("=== STRUCTURED_OUTPUT_END ===")
    
    # Display generated reports in rich text format
    print("\n" + "="*80)
    print("📋 GENERATED REPORTS - DETAILED VIEW")
    print("="*80)
    
    for file_data in output_data['files_generated']:
        file_type_icon = "📝" if file_data.get('file_type') == 'markdown' else "📄"
        file_type_label = "Markdown Report" if file_data.get('file_type') == 'markdown' else "Text File"
        print(f"\n{file_type_icon} {file_data['filename']} ({file_type_label})")
        print("-" * 60)
        # Display content with proper formatting
        content = file_data['content']
        print(content)
        print("-" * 60)
        print(f"📁 Saved to: {file_data['path']}")
        if file_data.get('file_type') == 'markdown':
            print("💡 This is a markdown file - open with any markdown viewer for rich formatting!")
    
    if output_data['images_generated']:
        print(f"\n🖼️ Generated {len(output_data['images_generated'])} images:")
        for img_data in output_data['images_generated']:
            print(f"  • {img_data['filename']} (saved to: {img_data['path']})")
    
    print("\n✅ Research completed successfully!")
    print(f"📊 Generated {len(output_data['files_generated'])} files and {len(output_data['images_generated'])} images")
    print(f"⏱️ Total execution time: {crew_execution_time:.2f} seconds")
    
    # Finish WandB run
    wandb_tracker.finish_run()
    print("🎯 WandB tracking completed!")