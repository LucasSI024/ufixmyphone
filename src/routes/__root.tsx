import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-mint">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Pagina niet gevonden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Deze pagina bestaat niet of is verplaatst.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Er ging iets mis</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Opnieuw proberen
          </button>
          <a href="/" className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            Naar home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "I Will Make It — Laat je telefoon repareren tegen jouw prijs" },
      { name: "description", content: "Plaats je kapotte telefoon op I Will Make It en ontvang biedingen van reparateurs door heel Nederland. Kies zelf het beste bod." },
      { name: "author", content: "I Will Make It" },
      { property: "og:title", content: "I Will Make It — Laat je telefoon repareren tegen jouw prijs" },
      { property: "og:description", content: "Plaats je kapotte telefoon op I Will Make It en ontvang biedingen van reparateurs door heel Nederland. Kies zelf het beste bod." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "I Will Make It — Laat je telefoon repareren tegen jouw prijs" },
      { name: "twitter:description", content: "Plaats je kapotte telefoon op I Will Make It en ontvang biedingen van reparateurs door heel Nederland. Kies zelf het beste bod." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/09f8f5d2-8f00-4f75-a34f-9b6649953dd2/id-preview-9e7218d7--3fae342b-05f3-4f40-a497-8bb46a6004bf.lovable.app-1779371307973.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/09f8f5d2-8f00-4f75-a34f-9b6649953dd2/id-preview-9e7218d7--3fae342b-05f3-4f40-a497-8bb46a6004bf.lovable.app-1779371307973.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
