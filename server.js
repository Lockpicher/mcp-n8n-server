import { Server } from "@modelcontextprotocol/sdk/server";
import { z } from "zod";
import axios from "axios";
import express from "express";

const PORT = process.env.PORT || 3000;
const N8N_URL = process.env.N8N_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

// Crear servidor MCP correcto
const server = new Server({
  name: "mcp-n8n-server",
  version: "1.0.0",
});

/*
|--------------------------------------------------------------------------
| TOOL: run_workflow
|--------------------------------------------------------------------------
*/
server.registerTool({
  name: "run_workflow",
  description: "Ejecuta un workflow en n8n mediante API",
  inputSchema: z.object({
    workflowId: z.string(),
    data: z.any().optional(),
  }),
  async execute({ workflowId, data }) {
    try {
      const response = await axios.post(
        `${N8N_URL}/api/v1/workflows/${workflowId}/run`,
        data || {},
        {
          headers: { "X-N8N-API-KEY": N8N_API_KEY }
        }
      );
      return response.data;
    } catch (err) {
      return { error: err.message };
    }
  },
});

/*
|--------------------------------------------------------------------------
| TOOL: execution_status
|--------------------------------------------------------------------------
*/
server.registerTool({
  name: "execution_status",
  description: "Consulta el estado de una ejecución en n8n",
  inputSchema: z.object({
    executionId: z.string(),
  }),
  async execute({ executionId }) {
    try {
      const response = await axios.get(
        `${N8N_URL}/api/v1/executions/${executionId}`,
        {
          headers: { "X-N8N-API-KEY": N8N_API_KEY }
        }
      );
      return response.data;
    } catch (err) {
      return { error: err.message };
    }
  },
});

// Express MCP endpoint
const app = express();
app.use(express.json());
app.post("/mcp", server.express());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
