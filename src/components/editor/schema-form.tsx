"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { asSchema, fieldLabel, properties, type JsonSchema } from "@/lib/content/json-schema";
import { cn } from "@/lib/utils";

/**
 * Renders an editing form directly from a JSON Schema.
 *
 * There is deliberately no per-page form code: adding a field to a zod schema
 * is enough for a control to appear here. `ui` hints from `.meta()` pick the
 * widget; everything else falls back to the JSON Schema `type`.
 */

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

/** Build an empty value for a schema — used when adding an array item. */
export function emptyValue(input: unknown): unknown {
  const schema = asSchema(input);
  if (schema.default !== undefined) return schema.default;
  if (schema.enum?.length) return schema.enum[0];

  switch (schema.type) {
    case "object": {
      const out: Record<string, unknown> = {};
      for (const [key, child] of properties(schema)) out[key] = emptyValue(child);
      return out;
    }
    case "array":
      return [];
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    default:
      return "";
  }
}

type FieldProps = {
  schema: JsonSchema;
  value: unknown;
  onChange: (next: unknown) => void;
  label: string;
  depth: number;
};

/** "Navigation links" -> "Navigation link", so item headers read naturally. */
function singular(label: string): string {
  return label.endsWith("s") && !label.endsWith("ss") ? label.slice(0, -1) : label;
}

function ArrayField({ schema, value, onChange, label, depth }: FieldProps) {
  const items = Array.isArray(value) ? value : [];
  const itemSchema = asSchema(schema.items);
  const itemLabel = singular(label);

  const replace = (index: number, next: unknown) =>
    onChange(items.map((item, i) => (i === index ? next : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{label}</legend>

      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-border bg-background/60 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {itemLabel} {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${itemLabel} ${index + 1} up`}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label={`Move ${itemLabel} ${index + 1} down`}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
              >
                <ChevronDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label={`Remove ${itemLabel} ${index + 1}`}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          <Field
            schema={itemSchema}
            value={item}
            onChange={(next) => replace(index, next)}
            label={`${itemLabel} ${index + 1}`}
            depth={depth + 1}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, emptyValue(itemSchema)])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
      >
        <Plus className="size-3.5" />
        Add {itemLabel.toLowerCase()}
      </button>
    </fieldset>
  );
}

function Field({ schema, value, onChange, label, depth }: FieldProps) {
  if (schema.type === "object") {
    const entries = properties(schema);
    const record = (value ?? {}) as Record<string, unknown>;

    return (
      <div className={cn("space-y-4", depth > 0 && "space-y-3")}>
        {entries.map(([key, child]) => (
          <Field
            key={key}
            schema={child}
            value={record[key]}
            onChange={(next) => onChange({ ...record, [key]: next })}
            label={fieldLabel(key, child)}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  }

  if (schema.type === "array") {
    return (
      <ArrayField
        schema={schema}
        value={value}
        onChange={onChange}
        label={label}
        depth={depth}
      />
    );
  }

  const description = schema.description ? (
    <span className="mt-1 block text-xs text-muted-foreground">{schema.description}</span>
  ) : null;

  if (schema.enum) {
    return (
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <select
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "mt-1.5")}
        >
          {schema.enum.map((option) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
        {description}
      </label>
    );
  }

  if (schema.type === "boolean") {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 rounded border-border"
        />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </label>
    );
  }

  if (schema.type === "number" || schema.type === "integer") {
    return (
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <input
          type="number"
          value={typeof value === "number" ? value : ""}
          onChange={(event) =>
            onChange(event.target.value === "" ? 0 : Number(event.target.value))
          }
          className={cn(inputClass, "mt-1.5")}
        />
        {description}
      </label>
    );
  }

  const text = typeof value === "string" ? value : "";

  if (schema.ui === "image") {
    return (
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <input
          type="text"
          value={text}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/images/example.png"
          className={cn(inputClass, "mt-1.5")}
        />
        {text ? (
          <span className="mt-2 block overflow-hidden rounded-lg border border-border bg-muted/40">
            {/* Dimensions are unknown here and this is a dev-only tool, so next/image adds nothing. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={text} alt="" className="h-28 w-full object-contain" />
          </span>
        ) : null}
        {description}
      </label>
    );
  }

  const multiline = schema.ui === "textarea";

  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          value={text}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "mt-1.5 resize-y")}
        />
      ) : (
        <input
          type="text"
          value={text}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "mt-1.5")}
        />
      )}
      {description}
    </label>
  );
}

export function SchemaForm({
  schema,
  value,
  onChange,
}: {
  schema: JsonSchema;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const entries = properties(schema);
  const record = (value ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-4">
      {entries.map(([key, child]) => (
        <details
          key={key}
          open
          className="group rounded-xl border border-border bg-card px-4 py-3"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
            {fieldLabel(key, child)}
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <Field
              schema={child}
              value={record[key]}
              onChange={(next) => onChange({ ...record, [key]: next })}
              label={fieldLabel(key, child)}
              depth={1}
            />
          </div>
        </details>
      ))}
    </div>
  );
}
