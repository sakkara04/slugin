'use client'

// user sign up form 
// TO-DO:
// --> fix email verification error on account creation

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs"
import { useState } from "react"
import { signup } from "../../actions"
import SignUpGoogle from "./signup-google"

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [activeTab, setActiveTab] = useState<"student" | "faculty">("student");
  return (
    <div className="flex flex-col gap-6 w-full">
      <Card>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
            Create your account
          </CardTitle>
          <CardDescription>
            Enter your email below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "student" | "faculty")}
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
              <form action={signup}>
                <input type="hidden" name="can_post" value="false" />
                <FieldGroup>
                  <Field className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="student-first_name">First Name</FieldLabel>
                      <Input id="student-first_name" name="first_name" type="text" className="h-11 border-input focus:border-primary focus:ring-primary/20" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="student-last_name">Last Name</FieldLabel>
                      <Input id="student-last_name" name="last_name" type="text" className="h-11 border-input focus:border-primary focus:ring-primary/20" required />
                    </Field>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="student-email">School Email</FieldLabel>
                    <Input
                      id="student-email"
                      name="email"
                      type="email"
                      className="h-11 border-input focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </Field>
                  <Field>
                    <Field className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="student-password">Password</FieldLabel>
                        <Input id="student-password" name="password" type="password" required className="h-11 border-input focus:border-primary focus:ring-primary/20" />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="student-confirm-password">
                          Confirm Password
                        </FieldLabel>
                        <Input id="student-confirm-password" name="confirm-password" type="password" required className="h-11 border-input focus:border-primary focus:ring-primary/20" />
                      </Field>
                    </Field>
                    <FieldDescription>
                      Must be at least 8 characters long.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-primary-foreground font-semibold shadow-md shadow-sky-500 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 hover:cursor-pointer"
                    >
                      Create account
                    </Button>
                  </Field>
                  {/* <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                        OR
                      </FieldSeparator>
                      
                      <Field>
                        <SignUpGoogle/>
                      </Field> */}
                  <FieldDescription className="text-center">
                    Already have an account? <a href="/signin" className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent font-semibold">Sign In</a>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </TabsContent>
            <TabsContent value="faculty" className="mt-0">
              
              <form action={signup}>
                <input type="hidden" name="can_post" value="true" />
                <FieldGroup>
                  <Field className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="faculty-first_name">First Name</FieldLabel>
                      <Input id="faculty-first_name" name="first_name" type="text" required className="h-11 border-input focus:border-primary focus:ring-primary/20" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="faculty-last_name">Last Name</FieldLabel>
                      <Input id="faculty-last_name" name="last_name" type="text" required className="h-11 border-input focus:border-primary focus:ring-primary/20" />
                    </Field>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="faculty-email">School Email</FieldLabel>
                    <Input
                      id="faculty-email"
                      name="email"
                      type="email"
                      className="h-11 border-input focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="faculty-website">Club or Faculty Website</FieldLabel>
                    <Input
                      id="faculty-website"
                      name="website"
                      type="website"
                      className="h-11 border-input focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </Field>
                  <Field>
                    <Field className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="faculty-password">Password</FieldLabel>
                        <Input id="faculty-password" name="password" type="password" className="h-11 border-input focus:border-primary focus:ring-primary/20" required />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="faculty-confirm-password">
                          Confirm Password
                        </FieldLabel>
                        <Input id="faculty-confirm-password" name="confirm-password" type="password" required className="h-11 border-input focus:border-primary focus:ring-primary/20" />
                      </Field>
                    </Field>
                    <FieldDescription>
                      Must be at least 8 characters long.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-accent-foreground font-semibold shadow-md shadow-amber-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 hover:cursor-pointer"
                    >
                      Create account
                    </Button>
                  </Field>
                  {/* <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                        OR
                      </FieldSeparator>
                      
                      <Field>
                        <SignUpGoogle/>
                      </Field> */}
                  <FieldDescription className="text-center">
                    Already have an account? <a href="/signin" className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent font-semibold">Sign In</a>
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
