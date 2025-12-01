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
| LISTA DE HERRAMIENTAS MCP
|--------------------------------------------------------------------------
*/
server.setHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "run_workflow",
        description: "Ejecuta un workflow de n8n via API"
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
| EJECUCIÓN DE HERRAMIENTAS MCP
|--------------------------------------------------------------------------
*/
server.setHandler("tools/call", async ({ name, arguments: args }) => {
  try {
    switch (name) {
      case "run_workflow": {
        const { workflowId, data } = args;

        const res = await axios.post(
          `${N8N_URL}/api/v1/workflows/${workflowId}/run`,
          data || {},
          {
            headers: {
              "X-N8N-API-KEY": N8N_API_KEY,
            },
          }
        );

        return { content: [{ type: "text", text: JSON.stringify(res.data) }] };
      }

      case "execution_status": {
        const { executionId } = args;

        const res = await axios.get(
          `${N8N_URL}/api/v1/executions/${executionId}`,
          {
            headers: {
              "X-N8N-API-KEY": N8N_API_KEY,
            },
          }
        );

        return { content: [{ type: "text", text: JS]()
