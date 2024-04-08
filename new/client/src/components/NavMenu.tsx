'use client';
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

function AuthButton() {
    const { data: session } = useSession();

    if(session) {
        return (
            <>
            {session?.user?.name} <br />
            {session?.user?.email} <br />
            <button onClick={() => signOut()}>Sign out</button>
            </>
        )
    }
    return (
        <>
        Not signed in <br></br>
        <button onClick={() => signIn("github", { callbackUrl: '/login-success' })}>Click to sign in</button>
        </>
    )
}

export default function NavMenu() {
    return (
        <div>
            <AuthButton />
        </div>
    )
}