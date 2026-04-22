import { cn } from "@/lib/utils";
import type { InquiryMessage, AppRole } from "@/types/domain";

type InquiryThreadProps = {
  messages: InquiryMessage[];
  viewerRole: AppRole;
};

function InquiryThread({ messages, viewerRole }: InquiryThreadProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.senderRole === viewerRole;

        return (
          <div
            key={message.id}
            className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-2xl rounded-[1.75rem] border px-5 py-4 shadow-sm",
                isOwnMessage
                  ? "border-foreground/10 bg-foreground text-background"
                  : "border-border/70 bg-card text-foreground",
              )}
            >
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] opacity-80">
                <span>{message.senderName}</span>
                <span>•</span>
                <span>
                  {new Date(message.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7">{message.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { InquiryThread };
