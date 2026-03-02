import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { promises as fs } from "node:fs";
import path from "node:path";

type TemplateKey = "order_customer" | "order_internal";

const templateRegistry: Record<TemplateKey, { label: string; relativePath: string }> = {
  order_customer: {
    label: "Order Customer Confirmation",
    relativePath: "src/modules/email-template/templates/order-customer.ts",
  },
  order_internal: {
    label: "Order Internal Alert",
    relativePath: "src/modules/email-template/templates/order-internal.ts",
  },
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isTemplateKey(value: string): value is TemplateKey {
  return value in templateRegistry;
}

function toAbsolutePath(relativePath: string): string {
  return path.resolve(process.cwd(), relativePath);
}

async function readTemplateFile(id: TemplateKey) {
  const definition = templateRegistry[id];
  const absolutePath = toAbsolutePath(definition.relativePath);
  const [content, stats] = await Promise.all([fs.readFile(absolutePath, "utf8"), fs.stat(absolutePath)]);

  return {
    id,
    label: definition.label,
    relative_path: definition.relativePath,
    updated_at: stats.mtime.toISOString(),
    content,
  };
}

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const templates = await Promise.all(
    (Object.keys(templateRegistry) as TemplateKey[]).map(async (id) => {
      return await readTemplateFile(id);
    }),
  );

  return res.status(200).json({
    templates,
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as Record<string, unknown>;
  const id = asString(body.id).trim() as TemplateKey;
  const content = asString(body.content);

  if (!isTemplateKey(id)) {
    return res.status(400).json({
      message: "Invalid template id.",
    });
  }

  if (!content.trim()) {
    return res.status(400).json({
      message: "Template content cannot be empty.",
    });
  }

  if (!content.includes("export const")) {
    return res.status(400).json({
      message: "Template file must export a template object.",
    });
  }

  // Block dangerous patterns that could be used for code injection
  const dangerousPatterns = [
    /\brequire\s*\(/i,
    /\bimport\s+.*\s+from\s/i,
    /\beval\s*\(/i,
    /\bFunction\s*\(/i,
    /\bprocess\.(exit|env|kill|abort)/i,
    /\bchild_process/i,
    /\bexecSync|spawnSync|execFile/i,
    /\bfs\.(writeFile|unlink|rmdir|rm|rename|chmod|chown)/i,
    /\bglobal\./i,
    /\b__dirname|__filename/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return res.status(400).json({
        message: "Template content contains disallowed code patterns.",
      });
    }
  }

  // Enforce maximum template size (100KB)
  if (Buffer.byteLength(content, "utf8") > 102400) {
    return res.status(400).json({
      message: "Template content exceeds maximum allowed size (100KB).",
    });
  }

  const relativePath = templateRegistry[id].relativePath;
  const absolutePath = toAbsolutePath(relativePath);

  await fs.writeFile(absolutePath, content, "utf8");

  const saved = await readTemplateFile(id);

  return res.status(200).json({
    template: saved,
  });
}
