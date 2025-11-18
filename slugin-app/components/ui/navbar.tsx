import React from "react";
import Link from "next/link";
import { Button } from "./button";
import { Lightbulb } from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #e6e6e6",
      }}
    >
      <div className="navbar-left" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/home" className="logo-link" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="flex items-center gap-5" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="bg-blue flex size-10 items-center justify-center rounded-md shadow-2xs" style={{ background: '#bae6fd', display: 'flex', width: 35, height: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
              <Lightbulb size={25} color="#023047" />
            </div>
            <h1 className="text-5xl" style={{ margin: 0, fontSize: 20 }}>SlugIn</h1>
          </div>
        </Link>
      </div>

      <div className="navbar-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/opportunities" className="nav-link">
          <Button variant="ghost">Opportunities</Button>
        </Link>

        <Link href="/post" className="nav-link">
          <Button variant="ghost">Post Opportunities</Button>
        </Link>

        <Link href="/profile" className="nav-link">
          <Button variant="ghost">Edit / Create Profile</Button>
        </Link>

        <form action="/auth/signout" method="post" className="signout-form">
          <Button variant="outline" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
