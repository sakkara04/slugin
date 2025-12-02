// user sign up page

import { SignUpForm } from "@/app/(login)/signupfaculty/signup-comps/signup-form"
import { Lightbulb } from "lucide-react"

export default function SignUpPage() {
  return (
     <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-blue flex size-6 items-center justify-center rounded-md shadow-2xs">
            <Lightbulb size={18} color="#023047" />
          </div>
          SlugIn
        </a>
        <SignUpForm/>
      </div>
    </div>
  )
}

