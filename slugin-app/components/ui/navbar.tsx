import React from "react";
import { Button } from "./button";
import { Lightbulb, User, Home, BookOpen, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "./dropdown-menu";

const Navbar: React.FC<{ user: any | null }> = ({ user }) => {
  const first_name = user?.user_metadata?.first_name
  const last_name = user?.user_metadata?.last_name
  const email = user?.user_metadata?.email

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sky-200/50 bg-white/70 backdrop-blur-xl">
      <nav className="container flex h-20 items-center justify-between px-6 mx-auto max-w-7xl">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center text-2xl shadow-md shadow-amber-200 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
            <Lightbulb className="text-sky-600" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            SlugIn
          </span>
        </a>
        <div className="flex items-center gap-3">
          <a href="/home">
            <Button
              variant="ghost"
              className="text-sky-700 hover:text-sky-900 hover:bg-sky-100 hover:cursor-pointer"
            >
              <Home />
              Home
            </Button>
          </a>
          <a href="/opportunities">
            <Button
              variant="ghost"
              className="text-sky-700 hover:text-sky-900 hover:bg-sky-100 hover:cursor-pointer"
            >
              <BookOpen />
              Opportunities
            </Button>
          </a>
          <a href="/post">
            <Button
              variant="ghost"
              className="text-sky-700 hover:text-sky-900 hover:bg-sky-100 hover:cursor-pointer"
            >
              <Plus />
              Post
            </Button>
          </a>
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sky-700 hover:text-sky-900 hover:bg-sky-100 hover:cursor-pointer">
                <User /> {first_name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white/90 backdrop-blur-lg shadow-lg shadow-sky-600/20 border border-sky-200/50">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-sky-700">{first_name} {last_name}</span>
                  <span className="text-xs text-sky-700">{email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-sky-200/50" />
              <DropdownMenuItem asChild className="flex justify-center hover:cursor-pointer font-semibold text-sky-700">
                <a href="/profile">Profile</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-sky-200/50" />
              <DropdownMenuItem asChild className="flex justify-center">
                <form action="/auth/signout" method="post" className="signout-form">
                  <Button variant="outline" type="submit" className="font-semibold border-sky-200/50 text-sky-700 hover:text-sky-900 hover:bg-sky-100 hover:cursor-pointer
  ">
                    Sign out
                  </Button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
