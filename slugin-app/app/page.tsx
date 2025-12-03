// landing page

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb, BookOpen, Users, Target, TrendingUp, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function StartPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-blue-50">
      <header className="sticky top-0 z-50 w-full border-b border-sky-200/50 bg-white/70 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between px-6 mx-auto max-w-7xl">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center text-2xl shadow-md shadow-amber-200 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              <Lightbulb className="text-sky-600" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              SlugIn
            </span>
          </a>
          <nav className="flex items-center gap-3">
            <a href="/signin">
              <Button variant="ghost" className="text-sky-700 hover:text-sky-900 hover:bg-sky-100 hover:cursor-pointer">
                Sign In
              </Button>
            </a>
            <a href="/signup">
              <Button variant="ghost" className="text-sky-700 hover:text-sky-900 hover:bg-sky-100 hover:cursor-pointer">
                Sign Up
              </Button>
            </a>
          </nav>
        </div>
      </header>
      <section className="container mx-auto max-w-7xl px-6 py-24 md:py-36">
        <div className="flex flex-col items-center text-center gap-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 text-sm font-medium text-amber-900 animate-lift shadow-lg shadow-amber-200/50">
            <Sparkles className="w-4 h-4" />
            <span>Your Gateway to Success</span>
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance max-w-5xl bg-gradient-to-br from-sky-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Find your next opportunity at UCSC
          </h1>
          <div className="flex-col">
            <p className="text-xl md:text-2xl max-w-2xl text-balance text-sky-600 leading-relaxed">
              Connect with clubs, research labs, and faculty.
            </p>
            <p className="text-xl md:text-2xl max-w-2xl text-balance text-sky-600 leading-relaxed">
              Discover opportunities that match your skills and interests.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <a href="/signup">
              <Button
                size="lg"
                className="text-lg px-10 py-7 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-sky-700 font-semibold shadow-md shadow-amber-200 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-glow hover:cursor-pointer"
              >
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </section>
      <section className="container mx-auto max-w-7xl px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-8 border-2 border-sky-100 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-sky-500">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-3 text-sky-900">Browse</h3>
            <p className="text-sky-700/70 leading-relaxed">
              Explore leadership positions and research roles across campus
            </p>
          </Card>
          <Card className="p-8 border-2 border-amber-100 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-amber-200">
              <Target className="w-7 h-7 text-sky-900" />
            </div>
            <h3 className="text-3xl font-bold mb-3 text-sky-900">Post</h3>
            <p className="text-sky-700/70 leading-relaxed">
              Promote available leadership and research opportunities to students
            </p>
          </Card>
          <Card className="p-8 border-2 border-sky-100 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-sky-500">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-3 text-sky-900">Manage</h3>
            <p className="text-sky-700/70 leading-relaxed">Save opportunities and mark them as applied with ease </p>
          </Card>
          <Card className="p-8 border-2 border-yellow-100 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-amber-200">
              <TrendingUp className="w-7 h-7 text-sky-900" />
            </div>
            <h3 className="text-3xl font-bold mb-3 text-sky-900">Build</h3>
            <p className="text-sky-700/70 leading-relaxed">Showcase your bio, major, and skills on your profile to stand out</p>
          </Card>
        </div>
      </section>
      <footer className="border-t border-sky-200/50 py-12 mt-32">
        <div className="container mx-auto max-w-7xl px-6 text-center text-sky-700/60">
          <p>© 2025 SlugIn - UC Santa Cruz</p>
        </div>
      </footer>
    </div>
  );
}
