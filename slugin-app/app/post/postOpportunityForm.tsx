"use client";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState } from "react"
import industries from "../profile/industries";
import majors from "../profile/majors";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { postOpportunity } from "./actions";
import { Input } from "@/components/ui/input";

export default function PostOpportunityForm(){  
  const [chosen, setChosen] = useState<string[]>([]);
  const [industriesAndMajors, setIndustriesAndMajors] = useState(industries.concat(majors).sort());
  
  const updateList = async (industry: string) => {
    setIndustriesAndMajors(industriesAndMajors.filter(a => a !== industry))
    setChosen([...chosen, industry]);
  }

  const removeItem = async (item: string) => {
    setIndustriesAndMajors([...industriesAndMajors, item].sort());
    setChosen(chosen.filter(a => a !== item));
  }

  return(
    <form action={postOpportunity}>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="title">Title</FieldLabel>
      <Input
        id="title"
        name="title"
        type="text"
        placeholder="e.g., Research Assistant Position"
        required
      />
    </Field>

    <Field>
      <FieldLabel htmlFor="description">Description</FieldLabel>
      <textarea
        id="description"
        name="description"
        rows={6}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        placeholder="Describe the opportunity, requirements, and responsibilities..."
        required
      />
      <FieldDescription>
        Provide a detailed description of the opportunity
      </FieldDescription>
    </Field>

    <Field>
      <FieldLabel htmlFor="deadline">Deadline/Expiry Date</FieldLabel>
      <Input
        id="deadline"
        name="deadline"
        type="date"
        required
      />
      <FieldDescription>
        Select when this opportunity expires
      </FieldDescription>
    </Field>

    <Field>
      <FieldLabel htmlFor="link">Application Link</FieldLabel>
      <Input
        id="link"
        name="link"
        type="text"
        placeholder="insert application link here"
        required
      />
    </Field>

    <Field>
      <FieldLabel htmlFor="location">Location</FieldLabel>
      <Input
        id="location"
        name="location"
        type="text"
        placeholder="e.g., UCSC Campus, Remote, Hybrid"
        required
      />
    </Field>
    
    <input type="hidden" name="tags" value={JSON.stringify(chosen)} />
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <Button variant="outline">Choose Categories/Tags Related to your Post ↓</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-max">
          {industriesAndMajors.map((industry) =>
              <DropdownMenuCheckboxItem key={industry} onSelect={() => updateList(industry)}>
                  {industry}
              </DropdownMenuCheckboxItem>)}
      </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-row flex-wrap">
        {chosen.map((item: string, index) =>
        <Item variant="outline" key={index} className="w-fit m-1 p-1 pl-2" size="sm">
            <ItemContent>
              <ItemTitle>{item}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button type="button" variant="secondary" size="sm" onClick={() => removeItem(item)}>
                X
              </Button>
            </ItemActions>
          </Item> 
        )}
      </div>

        <Field>
          <FieldLabel htmlFor="file">Flyer/Picture (Optional)</FieldLabel>
          <Input
            id="file"
            name="file"
            type="file"
            accept="image/*,.pdf"
          />
          <FieldDescription>
            Upload a flyer or picture for this opportunity
          </FieldDescription>
        </Field>

        <Field>
          <Button type="submit">
            Post Opportunity
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}