import { Server } from "@modelcontextprotocol/sdk/server";
import axios from "axios";
import express from "express";
import fs from "fs";

const PORT = process.env.PORT || 3000;
const N8N_URL = process.env.N8N_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

const tools = JSON.parse(fs.readFileSync("./tools.json", "utf8"));

// Servidor MCP de transporte básico
const server = new Server({
  name: "mcp-n8n-server",
  version: "1.0.0",
});

// Endpoint MCP transport
const app = express();
app.use(express.json());

// MCP handler manual
app.post("/mcp", async (req, res) => {
  try {
    const { method, params, id } = req.body;

    // tools/list
    if (method === "tools/list") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: tools.tools
        }
      });
    }

    // tools/call
    if (method === "tools/call") {
      const { name, arguments: args } = params;

      // run_workflow
      if (name === "run_workflow") {
        const { workflowId, data } = args;

        const result = await axios.post(
          `${N8N_URL}/api/v1/workflows/${workflowId}/run`,
          data || {},
          {
            headers: { "X-N8N-API-KEY": N8N_API_KEY }
          }
        );

        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              { type: "text", text: JSON.stringify(result.data, null, 2) }
            ]
          }
        });
      }

      // execution_status
      if (name === "execution_status") {
        const { executionId } = args;

        const result = await axios.get(
          `${N8N_URL}/api/v1/executions/${executionId}`,
          {
            headers: { "X-N8N-API-KEY": N8N_API_KEY }
          }
        );

        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              { type: "text", text: JSON.stringify(result.data, null, 2) }
            ]
          }
        });
      }

      // unknown
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            { type: "text", text: `Unknown tool: ${name}` }
          ]
        }
      });
    }

    // fallback
    res.json({
      jsonrpc: "2.0",
      id,
      result: { error: "Unknown method" }
    });

  } catch (err) {
    res.json({
      jsonrpc: "2.0",
      error: err.message
    });
  }
});

// health
app.get("/", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
