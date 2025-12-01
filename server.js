import { Server } from "@modelcontextprotocol/sdk/server";
import axios from "axios";
import express from "express";

const PORT = process.env.PORT || 3000;
const N8N_URL = process.env.N8N_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

// Crear servidor MCP compatible con todas las versiones
const server = new Server({
  name: "mcp-n8n-server",
  version: "1.0.0",
});

// MANEJADOR UNIVERSAL
server.on("request", async (req, respond) => {
  try {
    // -------------------------
    // tools/list
    // -------------------------
    if (req.method === "tools/list") {
      return respond({
        tools: [
          {
            name: "run_workflow",
            description: "Ejecuta un workflow en n8n vía API",
          },
          {
            name: "execution_status",
            description: "Obtiene el estado de una ejecución en n8n",
          }
        ]
      });
    }

    // -------------------------
    // tools/call
    // -------------------------
    if (req.method === "tools/call") {
      const { name, arguments: args } = req;

      // run_workflow
      if (name === "run_workflow") {
        const { workflowId, data } = args;

        const res = await axios.post(
          `${N8N_URL}/api/v1/workflows/${workflowId}/run`,
          data || {},
          {
            headers: {
              "X-N8N-API-KEY": N8N_API_KEY,
            }
          }
        );

        return respond({
          content: [
            { type: "text", text: JSON.stringify(res.data, null, 2) }
          ]
        });
      }

      // execution_status
      if (name === "execution_status") {
        const { executionId } = args;

        const res = await axios.get(
          `${N8N_URL}/api/v1/executions/${executionId}`,
          {
            headers: {
              "X-N8N-API-KEY": N8N_API_KEY,
            }
          }
        );

        return respond({
          content: [
            { type: "text", text: JSON.stringify(res.data, null, 2) }
          ]
        });
      }

      // Unknown tool
      return respond({
        content: [
          { type: "text", text: `Unknown tool: ${name}` }
        ]
      });
    }

    // -------------------------
    // Método desconocido
    // -------------------------
    return respond({
      content: [
        { type: "text", text: `Unknown method: ${req.method}` }
      ]
    });

  } catch (err) {
    return respond({
      content: [
        { type: "text", text: `Error: ${err.message}` }
      ]
    });
  }
});

// EXPRESS WRAPPER
const app = express();
app.use(express.json());

app.post("/mcp", server.express());

app.get("/", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
