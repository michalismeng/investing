"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "react-bootstrap";

function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        {session?.user?.name} <br />
        {session?.user?.email} <br />
        <Button onClick={() => signOut()} variant="outline-dark">
          Sign Out
        </Button>
        <hr className="w-100" />
      </>
    );
  }
  return (
    <>
      Not signed in <br></br>
        <Button onClick={() => signIn("github", { callbackUrl: "/login-success" })} variant="outline-dark">
          Click to sign in
        </Button>
      <hr className="w-100" />
    </>
  );
}

export default function NavMenu() {
  return (
    <div>
      <AuthButton />
    </div>
  );
}
