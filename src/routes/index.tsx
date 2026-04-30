import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { ArrowRight, Wrench, Users, MapPin, Sparkles, Search, MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LocalFixr — Find local help for anything, instantly" },
      { name: "description", content: "Hyperlocal platform to post small repair or task requests and get help from nearby helpers. Plumbing, tutoring, moving — all in one place." },
      { property: "og:title", content: "LocalFixr — Find local help for anything, instantly" },
      { property: "og:description", content: "Post a task. Get matched with local helpers in minutes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />

        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Hyperlocal help, on demand
              </div>
              <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
                Find <span className="text-gradient-brand">local help</span><br />for anything, instantly
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                Post small repair or task requests — plumbing, tutoring, moving help — and connect with reliable helpers right in your neighborhood.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Button size="lg" asChild className="bg-gradient-brand text-base shadow-glow hover:opacity-90">
                  <Link to="/dashboard">
                    Post a Task <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base">
                  <Link to="/dashboard">Browse tasks</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-brand opacity-20 blur-2xl" />
              <img
                src={heroImage}
                alt="Hyperlocal helpers connecting through the LocalFixr platform"
                className="relative w-full rounded-2xl shadow-glow"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">How LocalFixr works</h2>
          <p className="text-muted-foreground">Three simple steps to get help — or to help others.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Wrench, title: "Post a task", desc: "Tell us what you need help with — a quick title, location, and contact." },
            { icon: Search, title: "Browse & filter", desc: "Local helpers explore tasks by category and find ones they can solve." },
            { icon: MessageCircle, title: "Get it done", desc: "Connect directly, agree on the details, and check it off your list." },
          ].map((f) => (
            <Card key={f.title} className="border-border/60 p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-glow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-soft">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="overflow-hidden border-border/60 bg-gradient-brand p-10 text-primary-foreground shadow-glow">
          <div className="grid gap-8 md:grid-cols-3 md:text-center">
            {[
              { icon: Users, value: "10k+", label: "Active neighbors" },
              { icon: MapPin, value: "120", label: "Cities covered" },
              { icon: Wrench, value: "8 min", label: "Avg response time" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-center gap-3 md:flex-col md:gap-2">
                <s.icon className="h-7 w-7 opacity-80" />
                <div>
                  <div className="text-3xl font-bold">{s.value}</div>
                  <div className="text-sm opacity-80">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LocalFixr. Built with care.
      </footer>
    </div>
  );
}
