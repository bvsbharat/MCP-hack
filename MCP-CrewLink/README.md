# 🚀 MCP-CrewLink: AI Research Assistant with Model Context Protocol

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![CrewAI](https://img.shields.io/badge/CrewAI-0.28.0+-green.svg)](https://docs.crewai.com/)
[![MCP](https://img.shields.io/badge/MCP-1.0.0+-orange.svg)](https://modelcontextprotocol.io/)
[![WandB](https://img.shields.io/badge/WandB-0.16.0+-purple.svg)](https://wandb.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful AI research assistant that integrates **Model Context Protocol (MCP)** servers with **CrewAI** agents, featuring advanced capabilities including web search, image generation, file operations, and comprehensive **Weights & Biases (WandB)** tracking for research analytics.

## ✨ Key Features

### 🔍 **Intelligent Research Capabilities**
- **Web Search**: Real-time web research using Brave Search API
- **Content Analysis**: Comprehensive information gathering and analysis
- **Report Generation**: Automated markdown report creation with rich formatting
- **Visual Documentation**: AI-powered diagram and image generation

### 🛠️ **Advanced Tool Integration**
- **File System Operations**: Read, write, and manage research files
- **Image Generation**: High-quality images using OpenAI DALL-E 3
- **MCP Protocol**: Seamless tool integration via Model Context Protocol
- **CrewAI Agents**: Intelligent task coordination and execution

### 📊 **Research Analytics & Tracking**
- **WandB Integration**: Comprehensive experiment tracking and metrics
- **Performance Monitoring**: Tool usage analytics and execution times
- **Research Progress**: Track search queries, files, and images generated
- **System Metrics**: CPU, memory, and environment monitoring

### 🎯 **W&B Inference API Support**
- **Custom LLM Integration**: Support for W&B Inference API models
- **Advanced Model Configuration**: Configurable model parameters and headers
- **Fallback Support**: Graceful degradation to default LLM if W&B unavailable

## 🏗️ Project Architecture

```
MCP-CrewLink/
├── 📄 main.py                    # Main application with research workflow
├── 📊 wandb_tracker.py           # WandB integration and metrics tracking
├── 🖼️ servers/
│   └── image_server.py           # Custom MCP image generation server
├── 📁 files/                     # Generated research reports (auto-created)
├── 🖼️ images/                    # Generated images and diagrams (auto-created)
├── 📋 requirements.txt           # Python dependencies
├── ⚙️ .env                       # Environment configuration
├── 📊 wandb/                     # WandB experiment logs
├── 🧪 test_*.py                  # Testing and validation scripts
├── 📖 WANDB_SETUP.md             # WandB configuration guide
└── 📄 README.md                  # This documentation
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** (for MCP servers)
- **API Keys**: OpenAI, Brave Search, WandB (optional)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/bvsbharat/MCP-hack.git
cd MCP-CrewLink

# Install Python dependencies
pip install -r requirements.txt

# Install MCP servers globally
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-brave-search
```

### 2. Environment Configuration

Create a `.env` file with your API keys:

```env
# OpenAI Configuration (Required)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ORGANIZATION=your_org_id_here  # Optional

# Brave Search Configuration (Required)
BRAVE_API_KEY=your_brave_api_key_here

# Weights & Biases Configuration (Optional)
WANDB_ENTITY=your_wandb_entity        # Optional, defaults to user
WANDB_INFERENCE_PROJECT=demo          # Optional

# W&B Inference API (Optional - for custom LLM)
# WANDB_INFERENCE_API_KEY=your_wandb_inference_key
# WANDB_INFERENCE_MODEL=openai/meta-llama/Llama-4-Scout-17B-16E-Instruct
# WANDB_INFERENCE_PROJECT=crewai/pop_smoke

# Research Configuration (Optional)
RESEARCH_TOPIC=Model Context Protocol
RESEARCH_QUERY=How does MCP work and what are its key components?
```

### 3. WandB Setup (Optional but Recommended)

```bash
# Login to WandB
wandb login

# Test WandB integration
python test_wandb_simple.py
```

### 4. Run the Research Assistant

```bash
# Start the AI research workflow
python main.py
```

## 🔧 Core Components

### 🤖 Research Agent

The main AI agent configured with:
- **Role**: Research Analyst
- **Goal**: Comprehensive research and analysis
- **Tools**: Web search, file operations, image generation
- **LLM**: Configurable (default or W&B Inference)

### 🛠️ Custom MCP Tools

#### 1. **FileWriteTool**
```python
# Saves research reports and findings
file_tool.write_file(
    filename="research_report.md",
    content="# Research Findings...")
```

#### 2. **WebSearchTool**
```python
# Performs intelligent web searches
search_tool.search(
    query="Model Context Protocol architecture")
```

#### 3. **ImageGenerateTool**
```python
# Creates visual diagrams and illustrations
image_tool.generate_image(
    prompt="MCP architecture diagram",
    filename="mcp_diagram")
```

### 📊 WandB Analytics

Comprehensive tracking includes:
- **Tool Performance**: Execution times and success rates
- **Research Metrics**: Search queries, files, and images generated
- **System Information**: CPU, memory, and environment details
- **Agent Performance**: Task completion times and success rates

## 🎯 Usage Examples

### Basic Research Workflow

```bash
# Research a specific topic
RESEARCH_TOPIC="Artificial Intelligence" \
RESEARCH_QUERY="Latest developments in AI safety" \
python main.py
```

### Custom Research Configuration

```python
# Set environment variables programmatically
import os
os.environ['RESEARCH_TOPIC'] = 'Quantum Computing'
os.environ['RESEARCH_QUERY'] = 'Quantum supremacy achievements'

# Run the research workflow
exec(open('main.py').read())
```

### WandB Experiment Tracking

```python
from wandb_tracker import WandBTracker

# Initialize tracker with custom config
tracker = WandBTracker(
    project="my-research-project",
    config={"research_type": "literature_review"}
)

# Log custom metrics
tracker.log_metrics({"papers_reviewed": 25})
```

## 📋 Research Workflow

1. **🧹 Cleanup**: Remove old files and images
2. **🔍 Research Phase**: 
   - Multiple web searches for comprehensive coverage
   - Information gathering and analysis
   - Visual diagram creation
3. **📝 Report Generation**:
   - Structured markdown reports
   - Rich formatting with headers, lists, and links
   - Professional documentation standards
4. **📊 Analytics**: 
   - Performance metrics logging
   - Research progress tracking
   - System resource monitoring

## 🔑 API Keys & Setup

### OpenAI API
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create API key
3. Add to `.env` file

### Brave Search API
1. Visit [Brave Search API](https://api.search.brave.com/)
2. Sign up and generate key
3. Add to `.env` file

### Weights & Biases
1. Visit [WandB](https://wandb.ai/)
2. Create account
3. Run `wandb login`
4. Optional: Set up W&B Inference API

## 🎨 Customization

### Research Topics

```bash
# Environment variables
export RESEARCH_TOPIC="Your Topic"
export RESEARCH_QUERY="Your specific question"
```

### Agent Configuration

```python
# Modify agent parameters in main.py
agent_config = {
    "role": "Custom Researcher",
    "goal": "Your custom research goal",
    "backstory": "Your agent's background",
    "tools": tools,
    "verbose": True
}
```

### WandB Projects

```python
# Custom WandB configuration
wandb_tracker = WandBTracker(
    project="your-project-name",
    config={"custom_param": "value"}
)
```

## 🔍 Output & Results

### Generated Files
- **📄 Markdown Reports**: Comprehensive research documentation
- **🖼️ Images**: AI-generated diagrams and visualizations
- **📊 WandB Logs**: Experiment tracking and analytics

### Report Structure
- Executive Summary
- Key Findings
- Technical Details
- Applications & Use Cases
- Challenges & Limitations
- Future Implications
- References

## 🛠️ Development & Testing

### Run Tests

```bash
# Test basic setup
python test_setup.py

# Test WandB integration
python test_wandb_simple.py

# Test WandB inference
python wandb_inference_example.py
```

### Debug Mode

```python
# Enable verbose logging
agent = Agent(verbose=True, **agent_config)
```

## 🔧 Troubleshooting

### Common Issues

1. **Missing API Keys**
   ```bash
   # Check environment variables
   python -c "import os; print(os.getenv('OPENAI_API_KEY'))"
   ```

2. **MCP Server Issues**
   ```bash
   # Reinstall MCP servers
   npm install -g @modelcontextprotocol/server-filesystem
   npm install -g @modelcontextprotocol/server-brave-search
   ```

3. **WandB Connection**
   ```bash
   # Re-login to WandB
   wandb login --relogin
   ```

4. **Permission Errors**
   ```bash
   # Check directory permissions
   chmod 755 files/ images/
   ```

## 📦 Dependencies

### Core Dependencies
- **mcp>=1.0.0**: Model Context Protocol client
- **crewai>=0.28.0**: AI agent framework
- **openai>=1.12.0**: OpenAI API client
- **wandb>=0.16.0**: Experiment tracking
- **python-dotenv>=1.0.0**: Environment management

### Development Dependencies
- **pytest>=7.0.0**: Testing framework
- **jupyter>=1.0.0**: Interactive development
- **mypy>=1.7.0**: Type checking

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow PEP 8 style guidelines
- Add tests for new features
- Update documentation
- Include type hints

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Model Context Protocol](https://modelcontextprotocol.io/)** - For the innovative protocol design
- **[CrewAI](https://docs.crewai.com/)** - For the powerful agent framework
- **[Weights & Biases](https://wandb.ai/)** - For comprehensive experiment tracking
- **[OpenAI](https://openai.com/)** - For advanced AI capabilities
- **[Brave Search](https://search.brave.com/)** - For privacy-focused search API

## 🔗 Related Resources

- 📖 [MCP Documentation](https://modelcontextprotocol.io/docs)
- 🤖 [CrewAI Documentation](https://docs.crewai.com/)
- 📊 [WandB Documentation](https://docs.wandb.ai/)
- 🔧 [OpenAI API Reference](https://platform.openai.com/docs)
- 🔍 [Brave Search API Docs](https://api.search.brave.com/app/documentation)

## 📞 Support

For questions, issues, or contributions:

- 🐛 **Issues**: [GitHub Issues](https://github.com/bvsbharat/MCP-hack/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/bvsbharat/MCP-hack/discussions)
- 📧 **Email**: Contact the maintainers

---

<div align="center">

**Built with ❤️ for the AI research community**

*Empowering researchers with intelligent automation and comprehensive analytics*

</div>
