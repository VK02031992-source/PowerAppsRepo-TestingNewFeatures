# PowerAppsRepo-TestingNewFeatures

This repository demonstrates a simple PowerApps-like application integrated with a Model Context Protocol (MCP) server.

## Project Overview

This project consists of:
- **PowerApps Web Application**: A simple task management application with a modern UI
- **MCP Server**: A Model Context Protocol server that provides tools and resources for the application
- **Integration**: Seamless connection between the frontend and MCP server

## Features

- 👥 User management
- 📋 Task management (create, view, update)
- 🔗 MCP server integration
- ⚡ Real-time data updates
- 🎨 Modern, responsive UI

## MCP Server Tools

The MCP server provides the following tools:

1. **get_users** - Retrieve all users in the system
2. **get_tasks** - Retrieve all tasks in the system
3. **create_task** - Create a new task with title, status, and assignment
4. **update_task_status** - Update the status of an existing task

## MCP Server Resources

The server exposes the following resources:

- `powerapps://data/users` - Users database
- `powerapps://data/tasks` - Tasks database

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/VK02031992-source/PowerAppsRepo-TestingNewFeatures.git
cd PowerAppsRepo-TestingNewFeatures
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running the Web Application

To start the PowerApps web application:

```bash
npm start
```

The application will be available at `http://localhost:3000`

### Running the MCP Server (Standalone)

The MCP server can be run in standalone mode using stdio transport:

```bash
npm run mcp-server
```

**Note**: The web application includes a simulated MCP client for demonstration purposes. In a production environment, you would connect to the actual MCP server using the stdio transport or other supported transports.

## Application Features

### 1. View Users
- Click the "Refresh Users" button to load all users from the MCP server
- Displays user ID, name, email, and role in a formatted table

### 2. View Tasks
- Click the "Refresh Tasks" button to load all tasks from the MCP server
- Tasks are displayed with their ID, title, status (color-coded), and assignment

### 3. Create New Task
- Fill in the task title, status, and user ID to assign
- Click "Create Task" to add the task via the MCP server
- The task list automatically refreshes after creation

### 4. Update Task Status
- Enter the task ID and select the new status
- Click "Update Status" to modify the task via the MCP server
- The task list automatically refreshes after update

## Project Structure

```
PowerAppsRepo-TestingNewFeatures/
├── index.html          # Main HTML file for the web app
├── styles.css          # Styling for the application
├── app.js              # Client-side JavaScript with MCP client simulation
├── server.js           # Express server to serve the web application
├── mcp-server.js       # MCP server implementation
├── package.json        # Node.js project configuration
└── README.md          # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Protocol**: Model Context Protocol (MCP)
- **MCP SDK**: @modelcontextprotocol/sdk

## Model Context Protocol (MCP)

The Model Context Protocol is a standardized way for applications to provide context to LLMs and AI assistants. This project demonstrates:

- Tool registration and execution
- Resource exposure and reading
- Client-server communication patterns
- Practical integration with a web application

## Development

### Adding New Tools

To add new tools to the MCP server, edit `mcp-server.js`:

1. Add the tool definition in the `ListToolsRequestSchema` handler
2. Implement the tool logic in the `CallToolRequestSchema` handler

### Adding New Resources

To add new resources to the MCP server, edit `mcp-server.js`:

1. Add the resource definition in the `ListResourcesRequestSchema` handler
2. Implement the resource reading logic in the `ReadResourceRequestSchema` handler

## Future Enhancements

- [ ] Real-time MCP server connection (WebSocket)
- [ ] Authentication and authorization
- [ ] Database integration
- [ ] More advanced task management features
- [ ] User profile management
- [ ] Task filtering and search
- [ ] Analytics dashboard

## Contributing

This is a testing repository for exploring PowerApps and MCP integration features. Feel free to experiment and add new features!

## License

ISC

## Support

For issues or questions, please open an issue in the GitHub repository.
