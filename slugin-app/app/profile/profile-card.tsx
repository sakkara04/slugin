'use client'

// profile card

import Majors from "./majors";
import Industries from "./industries";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
const majorsList = Majors;
const industryList = Industries;

export default function ProfileCard() {
    const [firstName, setFirstName] = useState("");
    const [preferredName, setPreferredName] = useState("");
    const [lastName, setLastName] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [major, setMajor] = useState("");
    const [minor, setMinor] = useState("");
    const [year, setYear] = useState("");
    const [industry, setIndustry] = useState("");

     useEffect(() => {
   const fetchProfile = async () => {
     const {
       data: { user },
     } = await supabase.auth.getUser();

     if (!user) return;

     const { data, error } = await supabase
       .from("profiles")
       .select("*")
       .eq("id", user.id)
       .single();

     if (error) {
       console.error("Error fetching profile:", error.message);
     } else if (data) {
       setFirstName(data.first_name || "");
       setPreferredName(data.preferredName || "");
       setLastName(data.last_name || "");
       setPronouns(data.pronouns || "");
       setEmail(data.email || "");
       setBio(data.bio || "");
       setMajor(data.major || "");
       setMinor(data.minor || "");
       setYear(data.year || "");
       setIndustry(data.industry || "");
     }
   };

   fetchProfile();
 }, []);

    const handleSave = async () => {
        const {data: {user}, error: authError, } = await supabase.auth.getUser();

        if (authError || !user) {
            alert("You must be logged in to save your profile.");
            return;
        }

        const saved = {
            id: user.id,
            first_name: firstName,
            preferredName,
            last_name: lastName,
            pronouns,
            email,
            bio,
            major,
            minor,
            year,
            industry,
        };

        const { error } = await supabase.from("profiles").upsert(saved);

        if (error) {
            alert("Error saving profile: " + error.message);
        } else {
            alert("Profile saved successfully!");
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Edit Your Profile</CardTitle>
                    <CardDescription>
                        Fill out your academic and career preferences
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First name"
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="preferredName">Preferred Name</FieldLabel>
                            <Input
                                id="preferredName"
                                value={preferredName}
                                onChange={(e) => setPreferredName(e.target.value)}
                                placeholder="Preferred name"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last name"
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="pronouns">Pronouns *</FieldLabel>
                            <Input
                                id="pronouns"
                                value={pronouns}
                                onChange={(e) => setPronouns(e.target.value)}
                                placeholder="e.g. she/her, they/them"
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="email">Email (UCSC) *</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@ucsc.edu"
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="bio">Biography</FieldLabel>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="input w-full"
                                placeholder="Tell us a little about yourself"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="major">Major *</FieldLabel>
                            <select
                                id="major"
                                value={major}
                                onChange={(e) => setMajor(e.target.value)}
                                className="input w-full"
                                required
                            >
                                <option value="">-- Select major --</option>
                                {majorsList.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="minor">Minor</FieldLabel>
                            <select
                                id="minor"
                                value={minor}
                                onChange={(e) => setMinor(e.target.value)}
                                className="input w-full"
                            >
                                <option value="">-- Select minor --</option>
                                <option value="none">None</option>
                                {majorsList.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="year">Year in College *</FieldLabel>
                            <select
                                id="year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="input w-full"
                                required
                            >
                                <option value="">-- Select year --</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5+">5+</option>
                            </select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="industry">Preferred Industry</FieldLabel>
                            <select
                                id="industry"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="input w-full"
                            >
                                <option value="">-- Select industry --</option>
                                {industryList.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field>
                            <Button type="button" onClick={handleSave}>
                                Save Profile
                            </Button>
                        </Field>
                    </FieldGroup>
                </CardContent>
            </Card>
        </div>
    );
}
