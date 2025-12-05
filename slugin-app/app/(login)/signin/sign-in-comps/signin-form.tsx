'use client'

// user sign in form 

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { login } from "../../actions"
import SignInGoogle from "./signin-google"

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {


  return (
    <div className="flex flex-col gap-6 w-full">
      <Card>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
            Welcome back!
          </CardTitle>
          <CardDescription>
            Enter your email and password below to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
          defaultValue="student"
          className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 h-11 rounded-lg">
              <TabsTrigger
                value="student"
                className="rounded-lg font-semibold text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-600 data-[state=active]:to-blue-600 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md shadow-sky-500 transition-all duration-300 hover:cursor-pointer"
              >
                Student
              </TabsTrigger>
              <TabsTrigger
                value="faculty"
                className="rounded-lg font-semibold text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-accent-foreground data-[state=active]:shadow-md shadow-amber-200 transition-all duration-300 hover:cursor-pointer"
              >
                Club/Faculty
              </TabsTrigger>
            </TabsList>
            <TabsContent value="student" className="mt-0">
              <form action={login}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="student-email">Email</FieldLabel>
                    <Input
                      id="student-email"
                      name="email"
                      type="email"
                      className="h-11 border-input focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="student-password">Password</FieldLabel>
                    <Input
                      id="student-password"
                      name="password"
                      type="password"
                      className="h-11 border-input focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-primary-foreground font-semibold shadow-md shadow-sky-500 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 hover:cursor-pointer"
                    >
                      Sign in
                    </Button>
                  </Field>
                  {/* <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                        OR
                      </FieldSeparator>
                      
                      <Field>
                        <SignInGoogle/>
                      </Field> */}
                  <FieldDescription className="text-center">
                    Don't have an account? <a href="/signup" className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent font-semibold">Sign Up</a>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </TabsContent>
            <TabsContent value="faculty" className="mt-0">
              <form action={login}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="faculty-email">Email</FieldLabel>
                    <Input
                      id="faculty-email"
                      name="email"
                      type="email"
                      className="h-11 border-input focus:border-accent focus:ring-accent/20"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="faculty-password">Password</FieldLabel>
                    <Input
                      id="faculty-password"
                      name="password"
                      type="password"
                      className="h-11 border-input focus:border-accent focus:ring-accent/20"
                      required
                    />
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-accent-foreground font-semibold shadow-md shadow-amber-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 hover:cursor-pointer"
                    >
                      Sign in
                    </Button>
                  </Field>
                  {/* <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                        OR
                      </FieldSeparator>
                      
                      <Field>
                        <SignInGoogle/>
                      </Field> */}
                  <FieldDescription className="text-center">
                    Don't have an account? <a href="/signup" className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent font-semibold">Sign up</a>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <FieldDescription className="text-xs text-center">
        By clicking continue, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a>{" "}
        and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
