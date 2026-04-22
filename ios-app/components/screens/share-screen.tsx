"use client"

import { useState } from "react"
import { TopAppBar, ListSection } from "@/components/echospace"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { 
  Link2, 
  Users, 
  Mail, 
  Copy, 
  Check,
  Eye,
  Edit3,
  Shield
} from "lucide-react"
import type { Place } from "@/lib/types"

interface ShareScreenProps {
  place: Place
  onBack: () => void
}

type AccessRole = "viewer" | "editor" | "admin"

interface Collaborator {
  id: string
  name: string
  email: string
  role: AccessRole
}

export function ShareScreen({ place, onBack }: ShareScreenProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState<AccessRole>("viewer")
  const [collaborators] = useState<Collaborator[]>([
    { id: "1", name: "Alex Johnson", email: "alex@example.com", role: "editor" },
    { id: "2", name: "Sam Chen", email: "sam@example.com", role: "viewer" },
  ])

  const shareLink = `echospace.app/place/${place.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = () => {
    if (email.trim()) {
      // Handle invite logic
      setEmail("")
    }
  }

  const roleIcons: Record<AccessRole, React.ReactNode> = {
    viewer: <Eye className="h-4 w-4" />,
    editor: <Edit3 className="h-4 w-4" />,
    admin: <Shield className="h-4 w-4" />,
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopAppBar
        title="Share Place"
        subtitle={place.name}
        showBack
        onBack={onBack}
      />

      <div className="flex flex-col gap-6 px-5 py-6">
        {/* Share Link */}
        <section aria-labelledby="link-heading">
          <h2
            id="link-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground px-1"
          >
            Share Link
          </h2>
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Link2 className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  {shareLink}
                </p>
              </div>
            </div>
            <Button
              onClick={handleCopyLink}
              variant={copied ? "secondary" : "default"}
              className="w-full h-12 rounded-xl gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Invite People */}
        <section aria-labelledby="invite-heading">
          <h2
            id="invite-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground px-1"
          >
            Invite People
          </h2>
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Mail className="h-5 w-5 text-secondary-foreground" />
              </div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-11 rounded-lg"
              />
            </div>

            {/* Role Selection */}
            <div className="flex gap-2">
              {(["viewer", "editor", "admin"] as AccessRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
                    selectedRole === role
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {roleIcons[role]}
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>

            <Button
              onClick={handleInvite}
              disabled={!email.trim()}
              className="w-full h-12 rounded-xl"
            >
              Send Invite
            </Button>
          </div>
        </section>

        {/* Collaborators */}
        {collaborators.length > 0 && (
          <ListSection title={`Collaborators (${collaborators.length})`}>
            <div className="flex flex-col divide-y divide-border">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {collaborator.name.charAt(0)}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">
                      {collaborator.name}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">
                      {collaborator.email}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      collaborator.role === "admin" && "bg-primary/10 text-primary",
                      collaborator.role === "editor" && "bg-success/10 text-success",
                      collaborator.role === "viewer" && "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {roleIcons[collaborator.role]}
                    {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </ListSection>
        )}

        {/* Access Info */}
        <div className="flex items-start gap-3 rounded-xl bg-secondary p-4">
          <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">About Access Roles</span>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>Viewer:</strong> Can explore the place</li>
              <li><strong>Editor:</strong> Can add landmarks and notes</li>
              <li><strong>Admin:</strong> Full access including sharing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
