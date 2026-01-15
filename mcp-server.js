#!/usr/bin/env node

/**
 * Simple MCP Server for PowerApps Integration
 * This server implements the Model Context Protocol to provide tools and resources
 * that can be used by the PowerApps client application.
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

// Create MCP server instance
const server = new Server(
  {
    name: "powerapps-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Sample data store for the PowerApps application
const appData = {
  users: [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
  ],
  tasks: [
    { id: 1, title: "Complete Project", status: "In Progress", assignedTo: 1 },
    { id: 2, title: "Review Code", status: "Pending", assignedTo: 2 },
    { id: 3, title: "Deploy Application", status: "Completed", assignedTo: 1 },
  ],
};

// Register tool: List all users
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_users",
        description: "Get a list of all users in the system",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_tasks",
        description: "Get a list of all tasks in the system",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "create_task",
        description: "Create a new task",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the task",
            },
            status: {
              type: "string",
              description: "The status of the task (e.g., Pending, In Progress, Completed)",
            },
            assignedTo: {
              type: "number",
              description: "The ID of the user to assign the task to",
            },
          },
          required: ["title", "status", "assignedTo"],
        },
      },
      {
        name: "update_task_status",
        description: "Update the status of an existing task",
        inputSchema: {
          type: "object",
          properties: {
            taskId: {
              type: "number",
              description: "The ID of the task to update",
            },
            status: {
              type: "string",
              description: "The new status of the task",
            },
          },
          required: ["taskId", "status"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_users":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(appData.users, null, 2),
          },
        ],
      };

    case "get_tasks":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(appData.tasks, null, 2),
          },
        ],
      };

    case "create_task":
      const newTask = {
        id: appData.tasks.length + 1,
        title: args.title,
        status: args.status,
        assignedTo: args.assignedTo,
      };
      appData.tasks.push(newTask);
      return {
        content: [
          {
            type: "text",
            text: `Task created successfully: ${JSON.stringify(newTask, null, 2)}`,
          },
        ],
      };

    case "update_task_status":
      const task = appData.tasks.find((t) => t.id === args.taskId);
      if (!task) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Task with ID ${args.taskId} not found`,
            },
          ],
          isError: true,
        };
      }
      task.status = args.status;
      return {
        content: [
          {
            type: "text",
            text: `Task status updated successfully: ${JSON.stringify(task, null, 2)}`,
          },
        ],
      };

    default:
      return {
        content: [
          {
            type: "text",
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

// Register resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "powerapps://data/users",
        name: "Users Database",
        description: "List of all users in the system",
        mimeType: "application/json",
      },
      {
        uri: "powerapps://data/tasks",
        name: "Tasks Database",
        description: "List of all tasks in the system",
        mimeType: "application/json",
      },
    ],
  };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case "powerapps://data/users":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(appData.users, null, 2),
          },
        ],
      };

    case "powerapps://data/tasks":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(appData.tasks, null, 2),
          },
        ],
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PowerApps MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
