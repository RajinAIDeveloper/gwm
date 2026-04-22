"use client"

import Link from "next/link"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"

import { signOut } from "@/app/actions/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type MobileNavLink = {
  href: string
  label: string
  count?: number
}

type MobileNavDrawerProps = {
  links: MobileNavLink[]
  roleLabel?: string
  unreadInquiryCount: number
  userLabel?: string
}

function MobileNavDrawer({ links, roleLabel, unreadInquiryCount, userLabel }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false)
  const isSignedIn = Boolean(userLabel)

  async function handleSignOut() {
    await signOut()
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button className="lg:hidden" size="icon-sm" variant="outline">
          <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col" side="left">
        <SheetHeader className="pr-10">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold tracking-[0.22em] text-primary-foreground shadow-lg shadow-primary/20">
              GWM
            </div>
            <div>
              <SheetTitle>Marketplace navigation</SheetTitle>
              <SheetDescription>Move between browse, inquiries, saved items, and account actions.</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {isSignedIn ? (
          <div className="mt-5 rounded-3xl border border-border/70 bg-background/75 px-4 py-4">
            <p className="truncate text-sm font-semibold text-foreground">{userLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {roleLabel ? <Badge variant="outline">{roleLabel}</Badge> : null}
              {unreadInquiryCount > 0 ? <Badge>{unreadInquiryCount} unread</Badge> : null}
            </div>
          </div>
        ) : null}

        <nav className="mt-6 grid gap-2">
          {links.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                className="flex items-center justify-between rounded-3xl border border-border/70 bg-background/75 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                href={link.href}
              >
                <span>{link.label}</span>
                {link.count && link.count > 0 ? (
                  <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {link.count}
                  </span>
                ) : null}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <SheetFooter className="pt-6">
          {isSignedIn ? (
            <form action={handleSignOut}>
              <Button className="w-full" type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          ) : (
            <div className="grid gap-3">
              <SheetClose asChild>
                <Button asChild className="w-full">
                  <Link href="/sign-up">Create account</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export { MobileNavDrawer }
