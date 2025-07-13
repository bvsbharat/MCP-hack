# 🚀 MCP-Hack: Complete AI Research & Automation Platform

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 16+](https://img.shields.io/badge/node.js-16+-green.svg)](https://nodejs.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![CrewAI](https://img.shields.io/badge/CrewAI-0.28.0+-green.svg)](https://docs.crewai.com/)
[![MCP](https://img.shields.io/badge/MCP-1.0.0+-orange.svg)](https://modelcontextprotocol.io/)
[![WandB](https://img.shields.io/badge/WandB-0.16.0+-purple.svg)](https://wandb.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive AI research and automation platform that combines **Model Context Protocol (MCP)** servers with **CrewAI** agents, featuring a modern web interface and LinkedIn automation capabilities. This platform provides intelligent research tools, visual documentation, and comprehensive analytics tracking.

## 🏗️ Project Architecture

```
MCP-Hack/
├── 🤖 MCP-CrewLink/           # AI Research Assistant (Python/CrewAI)
│   ├── main.py                 # Main research workflow
│   ├── wandb_tracker.py        # WandB integration
│   ├── servers/                # Custom MCP servers
│   ├── files/                  # Generated reports
│   └── images/                 # Generated diagrams
├── 🌐 nextjs-mcp-client/      # Web Interface (Next.js/React)
│   ├── app/                    # Next.js app directory
│   ├── components/             # React components
│   ├── contexts/               # React contexts
│   └── api/                    # API routes
├── 🔗 Agent-mastra/           # LinkedIn Automation (TypeScript/Mastra)
│   ├── src/mastra/             # Mastra configuration
│   ├── agents/                 # AI agents
│   └── workflows/              # Automation workflows
└── 📄 README.md               # This documentation
```

## ✨ Key Features

### 🔍 **AI Research Assistant (MCP-CrewLink)**
- **Web Search**: Real-time research using EXA Search API
- **Content Analysis**: Comprehensive information gathering
- **Report Generation**: Automated markdown reports with rich formatting
- **Visual Documentation**: AI-powered diagram generation with DALL-E 3
- **WandB Integration**: Comprehensive experiment tracking and analytics
- **MCP Protocol**: Seamless tool integration via Model Context Protocol

### 🌐 **Web Interface (nextjs-mcp-client)**
- **Modern UI**: Clean, responsive interface built with Next.js and TailwindCSS
- **Real-time Research**: Interactive research interface with live results
- **Theme Support**: Multiple theme options for better user experience
- **Results Management**: View, manage, and export research results
- **File Handling**: Download generated reports and images

### 🤖 **LinkedIn Automation (Agent-mastra)**
- **AI-Powered Automation**: Intelligent LinkedIn message processing
- **Playwright Integration**: Browser automation for LinkedIn interactions
- **Context-Aware Responses**: Generate appropriate replies based on context
- **Memory System**: Persistent conversation history and user preferences
- **Safety Features**: Rate limiting and compliance with LinkedIn ToS

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **API Keys**: OpenAI, Brave Search, WandB (optional), Anthropic (for LinkedIn automation)

### 1. Clone the Repository

```bash
git clone https://github.com/bvsbharat/MCP-hack.git
cd MCP-hack
```

### 2. Setup MCP-CrewLink (AI Research Assistant)

```bash
cd MCP-CrewLink

# Install Python dependencies
pip install -r requirements.txt

# Install MCP servers globally
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-brave-search

# Create environment file
cp .env.example .env
# Edit .env with your API keys
```

### 3. Setup Next.js Web Client

```bash
cd ../nextjs-mcp-client

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Setup LinkedIn Automation (Optional)

```bash
cd ../Agent-mastra

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Create environment file
cp .env.example .env
# Edit .env with your credentials
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in each component directory:

#### MCP-CrewLink/.env
```env
# OpenAI Configuration (Required)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ORGANIZATION=your_org_id_here

# EXA Search Configuration (Required)
BRAVE_API_KEY=your_brave_api_key_here

# Weights & Biases Configuration (Optional)
WANDB_ENTITY=your_wandb_entity
WANDB_INFERENCE_PROJECT=demo

# Research Configuration
RESEARCH_TOPIC=Model Context Protocol
RESEARCH_QUERY=How does MCP work and what are its key components?
```

#### Agent-mastra/.env
```env
# AI Model API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# LinkedIn Credentials (for automation)
LINKEDIN_EMAIL=your_linkedin_email
LINKEDIN_PASSWORD=your_linkedin_password
```

## 🎯 Usage Examples

### AI Research Assistant

```bash
cd MCP-CrewLink

# Run basic research
python main.py

# Custom research topic
RESEARCH_TOPIC="Artificial Intelligence" \
RESEARCH_QUERY="Latest developments in AI safety" \
python main.py
```

### Web Interface

```bash
cd nextjs-mcp-client
npm run dev
# Open http://localhost:3000
```

### LinkedIn Automation

```bash
cd Agent-mastra

# Run demo
npm run demo:linkedin

# Start development server
npm run dev
```

## 📊 Features by Component

### MCP-CrewLink Features
- ✅ Web search and content analysis
- ✅ AI-powered report generation
- ✅ Image and diagram creation
- ✅ WandB experiment tracking
- ✅ File system operations
- ✅ Custom MCP server integration

### nextjs-mcp-client Features
- ✅ Modern React/Next.js interface
- ✅ Real-time research execution
- ✅ Theme customization
- ✅ Results visualization
- ✅ File download capabilities
- ✅ Responsive design

### Agent-mastra Features
- ✅ LinkedIn message automation
- ✅ AI-powered reply generation
- ✅ Browser automation with Playwright
- ✅ Conversation memory system
- ✅ Multiple reply modes (auto/draft/review)
- ✅ Safety and rate limiting

## 🛠️ Development

### Running Tests

```bash
# MCP-CrewLink tests
cd MCP-CrewLink
python test_setup.py
python test_wandb_simple.py

# Next.js client tests
cd nextjs-mcp-client
npm run lint
npm run build

# Agent-mastra tests
cd Agent-mastra
npm run test
```

### Development Servers

```bash
# Start all services
# Terminal 1: Research Assistant
cd MCP-CrewLink && python main.py

# Terminal 2: Web Interface
cd nextjs-mcp-client && npm run dev

# Terminal 3: LinkedIn Automation
cd Agent-mastra && npm run dev
```

## 📦 Dependencies

### Python Dependencies (MCP-CrewLink)
- `mcp>=1.0.0` - Model Context Protocol client
- `crewai>=0.28.0` - AI agent framework
- `openai>=1.12.0` - OpenAI API client
- `wandb>=0.16.0` - Experiment tracking
- `python-dotenv>=1.0.0` - Environment management

### Node.js Dependencies (nextjs-mcp-client)
- `next@14.0.0` - React framework
- `react@^18` - UI library
- `tailwindcss@^3.3.0` - CSS framework
- `typescript@^5` - Type safety
- `lucide-react@^0.294.0` - Icons

### Node.js Dependencies (Agent-mastra)
- `@mastra/core` - Mastra framework
- `@playwright/mcp` - Playwright MCP integration
- `playwright` - Browser automation
- `anthropic` - Claude AI integration

## 🔒 Security & Best Practices

### API Key Management
- Store all API keys in `.env` files
- Never commit `.env` files to version control
- Use environment-specific configurations
- Rotate keys regularly

### LinkedIn Automation Safety
- Respect LinkedIn's Terms of Service
- Implement rate limiting
- Use review mode for generated content
- Monitor automation activity

### Data Privacy
- Respect user privacy and data protection
- Implement secure authentication
- Use HTTPS in production
- Regular security audits

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation
- Include type hints (Python) and TypeScript types

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Model Context Protocol](https://modelcontextprotocol.io/)** - For the innovative protocol design
- **[CrewAI](https://docs.crewai.com/)** - For the powerful agent framework
- **[Mastra](https://mastra.ai/)** - For the automation framework
- **[Weights & Biases](https://wandb.ai/)** - For comprehensive experiment tracking
- **[OpenAI](https://openai.com/)** - For advanced AI capabilities
- **[Anthropic](https://anthropic.com/)** - For Claude AI integration
- **[Brave Search](https://search.brave.com/)** - For privacy-focused search API
- **[Next.js](https://nextjs.org/)** - For the modern web framework
- **[Playwright](https://playwright.dev/)** - For reliable browser automation

## 🔗 Related Resources

- 📖 [MCP Documentation](https://modelcontextprotocol.io/docs)
- 🤖 [CrewAI Documentation](https://docs.crewai.com/)
- 🔧 [Mastra Documentation](https://docs.mastra.ai/)
- 📊 [WandB Documentation](https://docs.wandb.ai/)
- ⚡ [Next.js Documentation](https://nextjs.org/docs)
- 🎭 [Playwright Documentation](https://playwright.dev/docs)
- 🔍 [EXA Search API Docs](https://api.search.brave.com/app/documentation)

## 📞 Support

For questions, issues, or contributions:

- 🐛 **Issues**: [GitHub Issues](https://github.com/bvsbharat/MCP-hack/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/bvsbharat/MCP-hack/discussions)
- 📧 **Email**: Contact the maintainers

---

<div align="center">

**Built with ❤️ for the AI research and automation community**

*Empowering researchers and professionals with intelligent automation and comprehensive analytics*

</div>