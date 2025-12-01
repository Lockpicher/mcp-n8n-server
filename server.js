import { Server } from "@modelcontextprotocol/sdk/server";
import axios from "axios";
import express from "express";

const PORT = process.env.PORT || 3000;
const N8N_URL = process.env.N8N_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

// MCP SERVER
const mcpServer = new Server({
  name: "mcp-n8n-server",
  version: "1.0.0",
});

/*
 * TOOL: Ejecutar workflow
 */
mcpServer.tool("run_workflow", {
  description: "Ejecuta un workflow de n8n usando su API",
  input: {
    type: "object",
    properties: {
      workflowId: { type: "string" },
      data: { type: "object" }
    },
    required: ["workflowId"]
  },
  async handler({ workflowId, data }) {
    try {
      const res = await axios.post(
        `${N8N_URL}/api/v1/workflows/${workflowId}/run`,
        data || {},
        {
          headers: {
            "X-N8N-API-KEY": N8N_API_KEY
          }
        }
      );
      return res.data;
    } catch (error) {
      return { error: error.message };
    }
  }
});

/*
 * TOOL: Ver estado de ejecución
 */
mcpServer.tool("execution_status", {
  description: "Consulta el estado de una ejecución de n8n",
  input: {
    type: "object",
    properties: {
      executionId: { type: "string" }
    },
    required: ["executionId"]
  },
  async handler({ executionId }) {
    try {
      const res = await axios.get(
        `${N8N_URL}/api/v1/executions/${executionId}`,
        {
          headers: { "X-N8N-API-KEY": N8N_API_KEY }
        }
      );
      return res.data;
    } catch (error) {
      return { error: error.message };
    }
  }
});

// Endpoint para MCP Proxy
const app = express();
app.use(express.json());
app.post("/mcp", mcpServer.express());

// Health check
app.get("/", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`MCP n8n server running on port ${PORT}`);
});
