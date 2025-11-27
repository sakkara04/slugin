"use client";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useEffect } from "react"
import industries from "../profile/industries";
import majors from "../profile/majors";

export default function DepartmentsDropDown(){  
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [industriesAndMajors, setIndustriesAndMajors] = React.useState<string[]>(industries.concat(majors).sort());
  
  const updateList = async (industry: string) => {
    setIndustriesAndMajors(industriesAndMajors.filter(a => a !== industry))
    setChosen([...chosen, industry]);
  }

  return(
  <>
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
    {chosen.map((item: boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.Key | null | undefined, index: React.Key | null | undefined) =>
            <Button type="button" className="w-fit" key={index} onClick={() => {setChosen(chosen.filter(a => a !== item));}}>
                {item} X
            </Button>)
    }
    </>
  );
}