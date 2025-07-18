import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fetch from "node-fetch";
import { z } from "zod";

// Create and start the MCP server
const server = new McpServer({
  name: "MCP Test Server",
  version: "1.0.0",
});
server.registerTool(
  "search",
  {
    title: "search",
    description:
      "Searches The Conversation website with the given search term and returns the HTML of the results page.",
    inputSchema: {
      q: z.string().max(100).trim().nonempty(),
    },
  },
  async ({ q }) => {
    const encodedTerm = encodeURIComponent(q);
    const url = `https://theconversation.com/au/search?q=${encodedTerm}`;
    const response = await fetch(url);
    const html = await response.text();
    return { content: [{ type: "text", text: html }] };
  },
);

const transport = new StdioServerTransport();
server.connect(transport);
