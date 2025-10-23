// start page

import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export default async function StartPage() {
  const supabase = await createClient();

  const {
        data: { user },
    } = await supabase.auth.getUser()

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 justify-center items-center sm:items-start">
        <div className="flex items-center gap-5">
          <div className="bg-blue flex size-10 items-center justify-center rounded-md shadow-2xs">
            <Lightbulb size={30} color="#023047" />
          </div>
          <h1 className="text-5xl">SlugIn App</h1>
        </div>
        <div className="flex w-full justify-between">
          <Button>
          <a href='/signup'>Sign Up</a>
          </Button>
          <Button>
          <a href='/signupfaculty'>Sign Up Faculty</a>
          </Button>
         <Button variant="outline">
          <a href='/signin'>Sign In</a>
          </Button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
