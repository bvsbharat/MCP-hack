import { MCPClient } from "@mastra/mcp";
 
// Configure MCPClient to connect to your server(s)
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
