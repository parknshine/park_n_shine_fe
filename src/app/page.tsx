"use client";

import { useState } from "react";
import {
  Search, Plus, ArrowRight, Trash2,
  DollarSign, AtSign, Eye, EyeOff, Tag,
} from "lucide-react";
import { ExampleForm } from "@/components/forms/example-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card, CardHeader, CardLabel, CardTitle, CardContent,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { useAuthStore } from "@/store";
import toast from "react-hot-toast";

const stack = [
  { label: "Next.js 16",      dot: "bg-neutral-800 dark:bg-neutral-300" },
  { label: "Tailwind CSS v4", dot: "bg-sky-500" },
  { label: "React Hook Form", dot: "bg-pink-500" },
  { label: "Axios",           dot: "bg-purple-500" },
  { label: "Zustand",         dot: "bg-amber-500" },
  { label: "Immer",           dot: "bg-emerald-500" },
  { label: "Radix UI",        dot: "bg-violet-500" },
  { label: "Zod",             dot: "bg-blue-500" },
];

export default function Home() {
  const [lastSubmit, setLastSubmit] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, user, setUser, clearAuth } = useAuthStore();

  // Combobox state
  const [fruit, setFruit] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsCount, setTagsCount] = useState<string[]>([]);
  const [errorCombo, setErrorCombo] = useState<string>("");

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-6 pb-20 pt-12">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Base Template · v0.1.0
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-foreground">Next.js </span>
            <span className="bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              Starter
            </span>
          </h1>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Production-ready template with type-safe forms, global state,
            HTTP layer, and accessible UI components.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {stack.map(({ label, dot }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">

          {/* ── Zustand + Immer ──────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardLabel>State management</CardLabel>
                  <CardTitle className="mt-1">Zustand + Immer</CardTitle>
                </div>
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background ${
                    isAuthenticated ? "bg-emerald-500" : "bg-border"
                  }`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-5 rounded-lg bg-muted px-3.5 py-2.5 text-sm">
                <span className="text-muted-foreground">Auth state: </span>
                <span className="font-mono text-foreground">
                  {isAuthenticated ? `logged in as "${user?.name}"` : "not logged in"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  prefix={<Plus className="h-3.5 w-3.5" />}
                  onClick={() =>
                    setUser({ id: "1", name: "Jane Doe", email: "jane@example.com" }, "tok_abc")
                  }
                >
                  Simulate login
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAuth}
                  disabled={!isAuthenticated}
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── React Hook Form + Zod ───────────────────────────── */}
          <Card>
            <CardHeader>
              <CardLabel>Form validation</CardLabel>
              <CardTitle className="mt-1">React Hook Form + Zod</CardTitle>
            </CardHeader>
            <CardContent>
              {lastSubmit && (
                <Alert variant="success" className="mb-5">
                  <AlertTitle>Last submission</AlertTitle>
                  <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-xs opacity-90">
                    {lastSubmit}
                  </pre>
                </Alert>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    suffix={<ArrowRight className="h-3.5 w-3.5" />}
                  >
                    Open form
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Example form</DialogTitle>
                    <DialogDescription>
                      Validated with Zod. Submit to see the result.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-5">
                    <ExampleForm
                      onSubmit={(v) => setLastSubmit(JSON.stringify(v, null, 2))}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* ── Button showcase ──────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardLabel>Components</CardLabel>
              <CardTitle className="mt-1">Button</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Default</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <Button size="sm" variant="ghost">Ghost</Button>
                <Button size="sm" variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" prefix={<Search className="h-3.5 w-3.5" />}>
                  Search
                </Button>
                <Button size="sm" variant="outline" prefix={<Plus className="h-3.5 w-3.5" />}>
                  New item
                </Button>
                <Button size="sm" variant="outline" suffix={<ArrowRight className="h-3.5 w-3.5" />}>
                  Continue
                </Button>
                <Button size="sm" variant="destructive" prefix={<Trash2 className="h-3.5 w-3.5" />}>
                  Delete
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Input & Textarea showcase ─────────────────────────── */}
          <Card>
            <CardHeader>
              <CardLabel>Components</CardLabel>
              <CardTitle className="mt-1">Input &amp; Textarea</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Default input" />
              <Input
                placeholder="Search…"
                prefix={<Search className="h-4 w-4" />}
              />
              <Input
                placeholder="0.00"
                prefix={<DollarSign className="h-4 w-4" />}
                suffix={<span className="text-xs font-medium">USD</span>}
              />
              <Input
                placeholder="username"
                prefix={<AtSign className="h-4 w-4" />}
              />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <Textarea placeholder="Textarea — multi-line input…" />
            </CardContent>
          </Card>

          {/* ── Combobox showcase ───────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardLabel>Components</CardLabel>
              <CardTitle className="mt-1">Combobox</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Single — basic */}
              <Combobox
                id="fruit"
                options={[
                  { label: "Apple", value: "apple" },
                  { label: "Banana", value: "banana" },
                  { label: "Blueberry", value: "blueberry" },
                  { label: "Grapes", value: "grapes" },
                  { label: "Mango", value: "mango" },
                  { label: "Orange", value: "orange" },
                  { label: "Pineapple", value: "pineapple" },
                  { label: "Strawberry", value: "strawberry" },
                ]}
                value={fruit}
                onChange={setFruit}
                placeholder="Select a fruit…"
                helperText={fruit ? `You selected: ${fruit}` : "Single select with search."}
              />

              {/* Single — with prefix */}
              <Combobox
                id="country"
                options={[
                  { label: "Indonesia", value: "id" },
                  { label: "United States", value: "us" },
                  { label: "United Kingdom", value: "uk" },
                  { label: "Japan", value: "jp" },
                  { label: "Germany", value: "de" },
                  { label: "France", value: "fr" },
                  { label: "Australia", value: "au" },
                  { label: "Canada", value: "ca" },
                ]}
                value={country}
                onChange={setCountry}
                prefix={<Search className="h-4 w-4" />}
                placeholder="Select a country…"
                helperText="Single select with prefix icon."
              />

              {/* Multi-select — showValues (default) */}
              <Combobox
                id="tags"
                multiple
                options={[
                  { label: "Design", value: "design" },
                  { label: "Engineering", value: "engineering" },
                  { label: "Marketing", value: "marketing" },
                  { label: "Product", value: "product" },
                  { label: "Sales", value: "sales" },
                  { label: "Support", value: "support" },
                ]}
                value={tags}
                onChange={setTags}
                prefix={<Tag className="h-4 w-4" />}
                placeholder="Select tags…"
                helperText="showValues={true} — tampil badge per item, bisa dihapus langsung."
              />

              {/* Multi-select — showValues={false} */}
              <Combobox
                id="tags-count"
                multiple
                showValues={false}
                options={[
                  { label: "Design", value: "design" },
                  { label: "Engineering", value: "engineering" },
                  { label: "Marketing", value: "marketing" },
                  { label: "Product", value: "product" },
                  { label: "Sales", value: "sales" },
                  { label: "Support", value: "support" },
                ]}
                value={tagsCount}
                onChange={setTagsCount}
                prefix={<Tag className="h-4 w-4" />}
                placeholder="Select tags…"
                helperText="showValues={false} — tampil jumlah saja, misal &quot;3 selected&quot;."
              />

              {/* Error state — validate on open/close */}
              <Combobox
                id="error-combo"
                options={[
                  { label: "Option A", value: "a" },
                  { label: "Option B", value: "b" },
                  { label: "Option C", value: "c" },
                ]}
                value={errorCombo}
                onChange={(v) => {
                  setErrorCombo(v);
                }}
                placeholder="Required field…"
                required
                errorMessage={!errorCombo ? "Please select an option." : undefined}
                helperText={errorCombo ? "Looks good!" : undefined}
              />
            </CardContent>
          </Card>

          {/* ── Toast showcase ───────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardLabel>Components</CardLabel>
              <CardTitle className="mt-1">Toast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("Changes saved successfully.")}
                >
                  Success
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.error("Something went wrong. Please try again.")}
                >
                  Error
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.loading("Saving changes…")}
                >
                  Loading
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: "Processing request…",
                        success: "Request completed!",
                        error: "Request failed.",
                      }
                    )
                  }
                >
                  Promise
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast("Heads up — this is a neutral message.", {
                      icon: "💡",
                    })
                  }
                >
                  Custom icon
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.dismiss()}
                >
                  Dismiss all
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Badge showcase ───────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardLabel>Components</CardLabel>
              <CardTitle className="mt-1">Badge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </CardContent>
          </Card>

          {/* ── Alert showcase ───────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardLabel>Components</CardLabel>
              <CardTitle className="mt-1">Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>This is a default informational alert.</AlertDescription>
              </Alert>
              <Alert variant="success">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Your changes have been saved successfully.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Your session will expire in 5 minutes.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong. Please try again.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground/60">
          Next.js · Tailwind v4 · React Hook Form · Axios · Zustand · Immer · Radix UI · Zod
        </p>

      </main>
    </div>
  );
}
