"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Option shape ────────────────────────────────────────────────────────────

export interface ComboboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ComboboxBaseProps {
  /** Option list: `[{ label: "Apple", value: "apple" }]` */
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  /** Message shown when no options match the search */
  emptyMessage?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  /** Extra class names applied to the outer wrapper */
  wrapperClassName?: string;
  /** Element rendered inside the left edge of the trigger */
  prefix?: React.ReactNode;
  /** Element rendered on the right of the trigger (replaces the default chevron) */
  suffix?: React.ReactNode;
  /** Helper text shown below the trigger */
  helperText?: string;
  /** Error message shown below the trigger; also applies error styles */
  errorMessage?: string;
  required?: boolean;
}

interface SingleProps extends ComboboxBaseProps {
  multiple?: false;
  value?: string;
  onChange?: (value: string) => void;
}

interface MultiProps extends ComboboxBaseProps {
  multiple: true;
  value?: string[];
  onChange?: (value: string[]) => void;
  /** Show selected values as removable badges in the trigger (default: true).
   *  Set to false to display a plain count label instead, e.g. "3 selected". */
  showValues?: boolean;
}

export type ComboboxProps = SingleProps | MultiProps;

// ─── Shared option list ───────────────────────────────────────────────────────

function OptionList({
  listboxId,
  filtered,
  emptyMessage,
  multiple,
  multiValue,
  singleValue,
  onSingleSelect,
  onMultiToggle,
  onClearAll,
}: Readonly<{
  listboxId?: string;
  filtered: ComboboxOption[];
  emptyMessage: string;
  multiple?: boolean;
  multiValue: string[];
  singleValue?: string;
  onSingleSelect: (v: string) => void;
  onMultiToggle: (v: string) => void;
  onClearAll: () => void;
}>) {
  return (
    <>
      <ul id={listboxId} role="listbox" aria-multiselectable={multiple} className="max-h-60 overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </li>
        ) : (
          filtered.map((opt) => {
            const selected = multiple
              ? multiValue.includes(opt.value)
              : singleValue === opt.value;
            return (
              <li key={opt.value} role="option" aria-selected={selected} aria-disabled={opt.disabled}>
                <button
                  type="button"
                  disabled={opt.disabled}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    multiple ? onMultiToggle(opt.value) : onSingleSelect(opt.value)
                  }
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                    selected && "bg-muted",
                    opt.disabled && "cursor-not-allowed text-muted-foreground hover:bg-transparent"
                  )}
                >
                  {multiple ? (
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        selected ? "border-primary bg-primary" : "border-border"
                      )}
                    >
                      {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </span>
                  ) : (
                    <Check
                      aria-hidden
                      className={cn(
                        "h-4 w-4 shrink-0 transition-opacity",
                        selected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  )}
                  <span className="truncate">{opt.label}</span>
                </button>
              </li>
            );
          })
        )}
      </ul>

      {/* Multi footer */}
      {multiple && multiValue.length > 0 && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <span className="text-xs text-muted-foreground">
            {multiValue.length} selected
          </span>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClearAll}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}
    </>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder = "Select an option…",
    searchPlaceholder = "Search…",
    emptyMessage = "No options found.",
    disabled,
    id,
    className,
    wrapperClassName,
    prefix,
    suffix,
    helperText,
    errorMessage,
    required,
    multiple,
  } = props;

  const showValues = multiple ? ((props as MultiProps).showValues ?? true) : false;

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // For single: Popover.Trigger + separate search bar in dropdown
  const searchRef = React.useRef<HTMLInputElement>(null);

  // For multi: Popover.Anchor + inline search in the field
  const inlineInputRef = React.useRef<HTMLInputElement>(null);

  const singleValue = !multiple ? (props as SingleProps).value : undefined;
  const multiValue: string[] = multiple ? ((props as MultiProps).value ?? []) : [];

  const filtered = React.useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  // Focus dropdown search when single combobox opens
  React.useEffect(() => {
    if (!multiple && open) {
      const t = setTimeout(() => searchRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open, multiple]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleSingleSelect(value: string) {
    (props as SingleProps).onChange?.(value);
    setOpen(false);
    setSearch("");
  }

  function handleMultiToggle(value: string) {
    const next = multiValue.includes(value)
      ? multiValue.filter((v) => v !== value)
      : [...multiValue, value];
    (props as MultiProps).onChange?.(next);
    inlineInputRef.current?.focus();
  }

  function removeChip(value: string, e: React.MouseEvent) {
    e.stopPropagation();
    const next = multiValue.filter((v) => v !== value);
    (props as MultiProps).onChange?.(next);
  }

  function handleClearAll() {
    (props as MultiProps).onChange?.([]);
  }

  // Inline input (multi) handlers
  function handleInlineFocus() {
    if (!disabled) { setSearch(""); setOpen(true); }
  }

  function handleInlineBlur() {
    setTimeout(() => { setOpen(false); setSearch(""); }, 150);
  }

  function handleInlineChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    if (!open) setOpen(true);
  }

  const hasBelow = !!(helperText || errorMessage);
  const triggerErrorClass = "border-destructive focus-visible:ring-destructive";
  const listboxId = id ? `${id}-listbox` : undefined;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={cn("flex flex-col gap-1", wrapperClassName)}>
      <Popover.Root
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSearch("");
        }}
      >

        {/* ══ SINGLE SELECT: button trigger + dropdown search bar ══ */}
        {!multiple && (
          <>
            <Popover.Trigger asChild>
              <button
                id={id}
                type="button"
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-haspopup="listbox"
                aria-required={required}
                aria-invalid={!!errorMessage || undefined}
                aria-describedby={hasBelow ? `${id}-helper` : undefined}
                disabled={disabled}
                className={cn(
                  "flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-50 justify-between",
                  errorMessage && triggerErrorClass,
                  className
                )}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  {prefix && (
                    <span className="shrink-0 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
                      {prefix}
                    </span>
                  )}
                  <span className={cn("truncate", !singleValue && "text-muted-foreground")}>
                    {singleValue
                      ? options.find((o) => o.value === singleValue)?.label
                      : placeholder}
                  </span>
                </span>
                {suffix ? (
                  <span className="shrink-0 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
                    {suffix}
                  </span>
                ) : (
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                sideOffset={4}
                align="start"
                style={{ width: "var(--radix-popover-trigger-width)" }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="z-50 rounded-lg border border-border bg-background shadow-lg outline-none"
              >
                {/* Dropdown search bar */}
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  {search && (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setSearch("")}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <OptionList
                  listboxId={listboxId}
                  filtered={filtered}
                  emptyMessage={emptyMessage}
                  multiple={false}
                  multiValue={[]}
                  singleValue={singleValue}
                  onSingleSelect={handleSingleSelect}
                  onMultiToggle={() => {}}
                  onClearAll={() => {}}
                />
              </Popover.Content>
            </Popover.Portal>
          </>
        )}

        {/* ══ MULTI SELECT: div anchor + badges + inline search ══ */}
        {multiple && (
          <>
            <Popover.Anchor asChild>
              <div
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-haspopup="listbox"
                onClick={() => inlineInputRef.current?.focus()}
                className={cn(
                  "flex w-full cursor-text items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors",
                  "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
                  showValues ? "min-h-10 flex-wrap" : "h-10",
                  errorMessage && "border-destructive focus-within:ring-destructive",
                  disabled && "cursor-not-allowed opacity-50",
                  className
                )}
              >
                {/* Left prefix */}
                {prefix && (
                  <span className="shrink-0 self-center text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
                    {prefix}
                  </span>
                )}

                {/* showValues=true → individual removable badges */}
                {showValues && multiValue.map((v) => {
                  const label = options.find((o) => o.value === v)?.label ?? v;
                  return (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      {label}
                      <button
                        type="button"
                        tabIndex={-1}
                        disabled={disabled}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => removeChip(v, e)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`Remove ${label}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}

                {/* Inline search input (badges mode) or count label + hidden input (count mode) */}
                {showValues ? (
                  <input
                    ref={inlineInputRef}
                    id={id}
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={disabled}
                    required={required}
                    aria-autocomplete="list"
                    aria-invalid={!!errorMessage || undefined}
                    aria-describedby={hasBelow ? `${id}-helper` : undefined}
                    value={search}
                    onChange={handleInlineChange}
                    onFocus={handleInlineFocus}
                    onBlur={handleInlineBlur}
                    placeholder={multiValue.length === 0 ? placeholder : ""}
                    className="min-w-24 flex-1 self-center bg-transparent placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
                  />
                ) : (
                  <>
                    <span className={cn("flex-1 truncate", multiValue.length === 0 && "text-muted-foreground")}>
                      {multiValue.length === 0
                        ? placeholder
                        : `${multiValue.length} selected`}
                    </span>
                    {/* Hidden input keeps focus / open behaviour */}
                    <input
                      ref={inlineInputRef}
                      id={id}
                      type="text"
                      autoComplete="off"
                      disabled={disabled}
                      required={required}
                      aria-autocomplete="list"
                      aria-invalid={!!errorMessage || undefined}
                      aria-describedby={hasBelow ? `${id}-helper` : undefined}
                      value={search}
                      onChange={handleInlineChange}
                      onFocus={handleInlineFocus}
                      onBlur={handleInlineBlur}
                      className="sr-only"
                    />
                  </>
                )}

                {/* Right: suffix or chevron */}
                {suffix ? (
                  <span className="ml-auto shrink-0 self-center text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
                    {suffix}
                  </span>
                ) : (
                  <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 self-center text-muted-foreground" />
                )}
              </div>
            </Popover.Anchor>

            <Popover.Portal>
              <Popover.Content
                sideOffset={4}
                align="start"
                style={{ width: "var(--radix-popover-trigger-width)" }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="z-50 rounded-lg border border-border bg-background shadow-lg outline-none"
              >
                <OptionList
                  listboxId={listboxId}
                  filtered={filtered}
                  emptyMessage={emptyMessage}
                  multiple={true}
                  multiValue={multiValue}
                  singleValue={undefined}
                  onSingleSelect={() => {}}
                  onMultiToggle={handleMultiToggle}
                  onClearAll={handleClearAll}
                />
              </Popover.Content>
            </Popover.Portal>
          </>
        )}

      </Popover.Root>

      {/* Helper / error text */}
      {(errorMessage || helperText) && (
        <p
          id={id ? `${id}-helper` : undefined}
          className={cn(
            "text-xs",
            errorMessage ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {errorMessage ?? helperText}
        </p>
      )}
    </div>
  );
}
