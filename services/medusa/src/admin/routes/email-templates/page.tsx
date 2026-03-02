import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type EmailTemplate = {
  id: string;
  label: string;
  relative_path: string;
  updated_at: string;
  content: string;
};

const shellStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "280px minmax(0, 1fr)",
  alignItems: "start",
};

const panelStyle: CSSProperties = {
  border: "1px solid #334155",
  borderRadius: 12,
  background: "rgba(15, 23, 42, 0.92)",
  color: "#e2e8f0",
};

const EmailTemplatesPage = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) || null,
    [templates, selectedId],
  );

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/admin/email-templates", { credentials: "include" });
      const payload = (await response.json()) as { templates?: EmailTemplate[]; message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Could not load templates.");
      }

      const loaded = Array.isArray(payload.templates) ? payload.templates : [];
      setTemplates(loaded);

      const preferredId = loaded.find((template) => template.id === selectedId)?.id || loaded[0]?.id || "";
      setSelectedId(preferredId);
      const selected = loaded.find((template) => template.id === preferredId);
      setContent(selected?.content || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedTemplate) {
      return;
    }

    setContent(selectedTemplate.content || "");
    setNotice(null);
    setError(null);
  }, [selectedTemplate?.id]);

  const onSave = async () => {
    if (!selectedTemplate) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/admin/email-templates", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedTemplate.id,
          content,
        }),
      });

      const payload = (await response.json()) as {
        template?: EmailTemplate;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Could not save template.");
      }

      const saved = payload.template;
      if (saved) {
        setTemplates((current) => current.map((item) => (item.id === saved.id ? saved : item)));
        setContent(saved.content);
      }

      setNotice("Template saved. Restart Medusa to apply changes.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save template.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, color: "#e2e8f0" }}>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Email Templates</h1>
        <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: 13 }}>
          Edit transactional order templates used by subscribers. Subscribers are backend workers and do not appear as
          a menu in Admin.
        </p>
      </div>

      <div style={shellStyle}>
        <div style={{ ...panelStyle, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>Templates</strong>
            <button
              type="button"
              onClick={() => void loadTemplates()}
              disabled={loading}
              style={{
                border: "1px solid #475569",
                borderRadius: 8,
                background: "#0f172a",
                color: "#e2e8f0",
                padding: "4px 8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 12,
              }}
            >
              {loading ? "Loading..." : "Reload"}
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {templates.map((template) => {
              const active = template.id === selectedId;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedId(template.id)}
                  style={{
                    textAlign: "left",
                    border: active ? "1px solid #c9a96e" : "1px solid #475569",
                    borderRadius: 10,
                    background: active ? "rgba(201, 169, 110, 0.12)" : "rgba(15, 23, 42, 0.5)",
                    color: "#e2e8f0",
                    padding: "10px 10px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{template.label}</div>
                  <div style={{ marginTop: 4, fontSize: 11, color: "#94a3b8" }}>{template.relative_path}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ ...panelStyle, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedTemplate?.label || "Select a template"}</div>
              <div style={{ marginTop: 4, color: "#94a3b8", fontSize: 12 }}>
                {selectedTemplate?.relative_path || ""}
              </div>
              <div style={{ marginTop: 4, color: "#94a3b8", fontSize: 12 }}>
                Last update: {selectedTemplate?.updated_at ? new Date(selectedTemplate.updated_at).toLocaleString() : "-"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void onSave()}
              disabled={!selectedTemplate || saving}
              style={{
                border: "1px solid #b89b66",
                borderRadius: 9,
                background: "#c9a96e",
                color: "#0f172a",
                fontWeight: 700,
                padding: "8px 12px",
                cursor: !selectedTemplate || saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>

          {notice ? <p style={{ margin: "0 0 10px", color: "#86efac", fontSize: 12 }}>{notice}</p> : null}
          {error ? <p style={{ margin: "0 0 10px", color: "#fca5a5", fontSize: 12 }}>{error}</p> : null}

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={!selectedTemplate}
            style={{
              width: "100%",
              minHeight: 540,
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#020617",
              color: "#e2e8f0",
              padding: 12,
              fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
              fontSize: 12,
              lineHeight: 1.55,
              resize: "vertical",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Email Templates",
});

export default EmailTemplatesPage;
