// user sign up page

import { SignInForm } from "@/app/(login)/signin/sign-in-comps/signin-form"
import { Lightbulb, ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 via-amber-50 to-blue-50">
      <div className="w-full max-w-lg relative">
        <a href="/" className="absolute left-0 top-0 inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity text-sky-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </a>
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center text-2xl shadow-md shadow-amber-200 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <Lightbulb size="20" className="text-sky-600" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">SlugIn</h1>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}

