import { Server } from "@modelcontextprotocol/sdk/server";
import axios from "axios";
import express from "express";

const PORT = process.env.PORT || 3000;
const N8N_URL = process.env.N8N_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

const server = new Server({
  name: "mcp-n8n-server",
  version: "1.0.0",
});

/*
|--------------------------------------------------------------------------
| LISTA DE HERRAMIENTAS
|--------------------------------------------------------------------------
*/
server.setHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "run_workflow",
        description: "Ejecuta un workflow en n8n vía API"
      },
      {
        name: "execution_status",
        description: "Obtiene el estado de una ejecución de n8n"
      }
    ]
  };
});

/*
|--------------------------------------------------------------------------
| EJECUCIÓN DE HERRAMIENTAS
|--------------------------------------------------------------------------
*/
server.setHandler("tools/call", async ({ name, arguments: args }) => {
  try {
    if (name === "run_workflow") {
      const { workflowId, data } = args;

      const res = await axios.post(
        `${N8N_URL}/api/v1/workflows/${workflowId}/run`,
        data || {},
        {
          headers: {
            "X-N8N-API-KEY": N8N_API_KEY
          }
        }
      );

      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) }
        ]
      };
    }

    if (name === "execution_status") {
      const { executionId } = args;

      const res = await axios.get(
        `${N8N_URL}/api/v1/executions/${executionId}`,
        {
          headers: {
            "X-N8N-API-KEY": N8N_API_KEY
          }
        }
      );

      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) }
        ]
      };
    }

    return {
      content: [
        { type: "text", text: `Unknown tool: ${name}` }
      ]
    };

  } catch (err) {
    return {
      content: [
        { type: "text", text: `Error: ${err.message}` }
      ]
    };
  }
});

/*
|--------------------------------------------------------------------------
| EXPRESS WRAPPER PARA MCP
|--------------------------------------------------------------------------
*/
const app = express();
app.use(express.json());

app.post("/mcp", server.express());

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
