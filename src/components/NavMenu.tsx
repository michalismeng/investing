"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function NavMenu() {
  const { data: session } = useSession()
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (!parts.length) {
      return "";
    }
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    } else {
      return parts[0][0];
    }
  };
  return (
    <>
      <div className="navbar bg-base-300">
        <div className="flex flex-1">
          <a href="/" className="flex flex-row gap-4 items-end flex-1 font-bold text-xl align-middle">
            <img src="/icon.png"></img>
            Stock Research Platform
          </a>
        </div>

        {session && (
          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle bg-white"
              >
                <div className="w-10 rounded-full">
                  <span>{getInitials(session?.user?.name || "")}</span>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a onClick={() => signOut()}>
                    Log out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) || <a className="btn btn-ghost" onClick={() => signIn("github", { callbackUrl: "/login-success" })}>Log In</a>}
      </div>
    </>
  );
}
