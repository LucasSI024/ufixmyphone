import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "new_bid" | "bid_accepted" | "bid_rejected" | "request_status_changed";
  title: string;
  body: string | null;
  request_id: string | null;
  read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, type, title, body, request_id, read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setItems(data as Notification[]);
    };
    load();

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) return null;

  const unread = items.filter((n) => !n.read).length;

  const markOne = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const markAll = async () => {
    if (unread === 0) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Meldingen" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-glow">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border/60 p-3">
          <p className="font-display text-sm font-semibold">Meldingen</p>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={markAll} className="h-7 text-xs">
              <CheckCheck className="h-3.5 w-3.5" /> Alles gelezen
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[60vh]">
          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nog geen meldingen.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {items.map((n) => {
                const inner = (
                  <div
                    className={cn(
                      "flex gap-3 px-4 py-3 text-left transition hover:bg-surface/60",
                      !n.read && "bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        n.read ? "bg-muted-foreground/30" : "bg-primary",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{n.title}</p>
                      {n.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {n.body}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.created_at), {
                          addSuffix: true,
                          locale: nl,
                        })}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markOne(n.id);
                        }}
                        className="self-start text-muted-foreground hover:text-foreground"
                        aria-label="Markeer als gelezen"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );

                return (
                  <li key={n.id}>
                    {n.request_id ? (
                      <Link
                        to="/request/$id"
                        params={{ id: n.request_id }}
                        onClick={() => {
                          if (!n.read) markOne(n.id);
                          setOpen(false);
                        }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
