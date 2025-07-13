# LinkedIn Automation Agent with Mastra MCP

This project demonstrates how to create an AI agent using Mastra that automates LinkedIn interactions using the Playwright MCP (Model Context Protocol) server. The agent can navigate LinkedIn, read messages, and generate contextually appropriate replies.

## Features

🤖 **AI-Powered LinkedIn Agent**
- Automated LinkedIn navigation using Playwright
- Intelligent message analysis and reply generation
- Context-aware responses based on sender profiles and message content
- Memory system for maintaining conversation context

🎭 **Playwright Integration**
- Browser automation for LinkedIn interactions
- Dynamic content handling
- Authentication management
- Rate limiting and safety measures

⚡ **Workflow Automation**
- Complete LinkedIn message processing workflow
- Multiple reply modes: auto-send, draft, or review
- Batch processing of multiple messages
- Structured output and logging

🧠 **Memory & Context**
- Persistent conversation history
- User profile and preference storage
- Thread-based context management
- Semantic recall capabilities

## Project Structure

```
src/
├── mastra/
│   ├── agents/
│   │   ├── linkedin-agent.ts      # Main LinkedIn automation agent
│   │   └── weather-agent.ts       # Example weather agent
│   ├── workflows/
│   │   ├── linkedin-workflow.ts   # LinkedIn message processing workflow
│   │   └── weather-workflow.ts    # Example weather workflow
│   ├── mcp/
│   │   └── mcp.ts                 # MCP client configuration
│   └── index.ts                   # Main Mastra configuration
├── linkedin-demo.ts               # Demo script showcasing functionality
└── ...
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# AI Model API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# LinkedIn Credentials (for automation)
LINKEDIN_EMAIL=your_linkedin_email
LINKEDIN_PASSWORD=your_linkedin_password

# Optional: Custom LinkedIn session cookies
LINKEDIN_SESSION_COOKIE=your_session_cookie
```

### 3. Playwright Setup

Install Playwright browsers:

```bash
npx playwright install
```

### 4. MCP Server Configuration

The project is pre-configured to use the Playwright MCP server. The configuration is in `src/mastra/mcp/mcp.ts`:

```typescript
export const mcp = new MCPClient({
  servers: {
    playwright: {
      command: "npx",
      args: [
        "@playwright/mcp@latest",
      ],
    },
  },
});
```

## Usage

### Running the Demo

To see the LinkedIn agent in action:

```bash
npm run demo:linkedin
```

This will run a comprehensive demo showing:
- Message analysis and reply generation
- Playwright navigation simulation
- Workflow execution
- Memory and context management
- Safety and best practices

### Using the Agent Directly

```typescript
import { mastra } from './src/mastra/index';

// Get the LinkedIn agent
const linkedinAgent = mastra.getAgent('linkedinAgent');

// Generate a reply to a LinkedIn message
const response = await linkedinAgent.generate(
  'Analyze this LinkedIn message and generate a professional reply: "Hi! I saw your profile and would love to connect."',
  {
    maxSteps: 3,
    resourceId: 'user-123',
    threadId: 'linkedin-conversation-1',
  }
);

console.log('Generated reply:', response.text);
```

### Running the Workflow

```typescript
import { mastra } from './src/mastra/index';

// Execute the LinkedIn workflow
const workflowResult = await mastra.getWorkflow('linkedinWorkflow')?.execute({
  linkedinUrl: 'https://www.linkedin.com/messaging/',
  replyMode: 'review', // 'auto', 'draft', or 'review'
  maxMessages: 5,
  customInstructions: 'Be friendly and professional. Focus on building genuine connections.'
});

console.log('Workflow result:', workflowResult);
```

### Development Server

Start the Mastra development server:

```bash
npm run dev
```

This will start the server with hot reloading and make your agents and workflows available via API endpoints.

## Agent Configuration

The LinkedIn agent is configured with:

- **Model**: Claude 3.5 Sonnet (Anthropic)
- **Tools**: Playwright MCP tools for browser automation
- **Memory**: LibSQL storage for conversation history
- **Instructions**: Professional LinkedIn interaction guidelines

### Customizing Instructions

You can modify the agent's behavior by updating the instructions in `src/mastra/agents/linkedin-agent.ts`:

```typescript
instructions: `
  You are a professional LinkedIn automation assistant...
  // Add your custom instructions here
`
```

## Workflow Modes

The LinkedIn workflow supports three reply modes:

1. **Auto Mode** (`auto`): Automatically sends generated replies
2. **Draft Mode** (`draft`): Saves replies as drafts for later review
3. **Review Mode** (`review`): Generates replies but requires manual approval

## Safety and Best Practices

⚠️ **Important Considerations**:

1. **LinkedIn Terms of Service**: Ensure your automation complies with LinkedIn's ToS
2. **Rate Limiting**: Implement appropriate delays between actions
3. **Authentication**: Use secure methods for LinkedIn login
4. **Content Quality**: Always review generated content before sending
5. **Privacy**: Respect user privacy and data protection regulations

### Recommended Safety Measures

- Start with small batches of messages
- Use review mode initially to validate responses
- Implement human oversight for important conversations
- Monitor for any unusual LinkedIn behavior or restrictions
- Keep automation patterns human-like

## Troubleshooting

### Common Issues

1. **MCP Connection Failed**
   ```bash
   # Ensure Playwright MCP is installed
   npm install @playwright/mcp@latest
   ```

2. **LinkedIn Authentication Issues**
   - Check your credentials in `.env`
   - Consider using session cookies instead of password
   - Enable 2FA if required by LinkedIn

3. **Memory Database Issues**
   ```bash
   # Clear the memory database
   rm -f linkedin-memory.db
   ```

4. **Agent Not Found**
   - Ensure the agent is properly registered in `src/mastra/index.ts`
   - Check for import/export errors

### Debug Mode

Enable debug logging by setting the log level:

```typescript
// In src/mastra/index.ts
logger: new PinoLogger({
  name: 'Mastra',
  level: 'debug', // Change from 'info' to 'debug'
})
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Disclaimer

This project is for educational and demonstration purposes. Users are responsible for ensuring their use of LinkedIn automation complies with LinkedIn's Terms of Service and applicable laws. The authors are not responsible for any account restrictions or violations that may result from using this software.

---

**Built with [Mastra](https://mastra.ai) - The TypeScript AI Framework**