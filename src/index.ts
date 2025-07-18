import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fetch from "node-fetch";
import { unknown, z } from "zod";

// Create and start the MCP server
const server = new McpServer({
  name: "Ben MCP Test Server",
  version: "0.1.0",
});

server.registerTool(
  "subscribe_to_newsletter",
  {
    title: "Subscribe to newsletter",
    description: "Subscribes an email address to a newsletter",
    inputSchema: {
      emailAddress: z.string().email().trim().nonempty(),
      newsletterId: z.number().min(1),
    },
  },
  async ({ emailAddress, newsletterId }) => {
    const response = await fetch(
      "http://localhost:3000/api/v1/newsletter_leads",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LEADSBRIDGE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          automatic_confirmation: false,
          email_address: emailAddress,
          newsletter: newsletterId,
          region_code: "au",
          source: "mcp-test-server",
        }),
      },
    );
    const message = response.ok
      ? "Subscription was successful"
      : "Subscription failed";
    return { content: [{ type: "text", text: message }] };
  },
);

server.registerTool(
  "list_newsletters",
  {
    title: "List all possible newsletters",
    description: "Lists all possible newsletters to subscribe to",
  },
  async ({}) => {
    const response = await fetch("http://localhost:3000/api/v1/newsletters", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.LEADSBRIDGE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const NewsletterSchema = z.object({
      id: z.number(),
      name: z.string(),
    });
    const NewsletterArraySchema = z.array(NewsletterSchema);
    const json = await response.json();
    const result = NewsletterArraySchema.parse(json);
    const list = result
      .map((newsletter) => `${newsletter.name} (ID is ${newsletter.id})`)
      .join(", ");
    return { content: [{ type: "text", text: list }] };
  },
);

const transport = new StdioServerTransport();
server.connect(transport);
