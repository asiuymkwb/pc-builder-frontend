import { useNavigate } from "react-router"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"

type Props = {
  open: boolean
  onClose: () => void
}

export default function LoginPromptModal({ open, onClose }: Props) {
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Accedi per continuare</DialogTitle>
          <DialogDescription>
            Devi essere loggato per aggiungere componenti e salvare la tua build.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-2">
          <Button className="w-full" onClick={() => navigate("/login")}>
            <LogIn className="w-4 h-4 mr-2" />
            Accedi
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/register")}>
            <UserPlus className="w-4 h-4 mr-2" />
            Crea account
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
            Continua a sfogliare
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
