import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session && session.user?.email) {
    return redirect("/companies")
  }

  return (
    <>
      {session?.user?.name ? (
          <div className="hero bg-base-200">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-5xl font-bold">Successfull Login</h1>
                <p className="py-6">
                  You have successfully logged into the platform. <Link href={"/companies"}>Click to go to main page.</Link>
                </p>
              </div>
            </div>
          </div>
      ) : (
          <div className="hero bg-base-200">
            <div className="hero-content text-center">
              <div className="">
                <h1 className="text-5xl font-bold">Something went wrong</h1>
                <p className="py-6">
                  You are not logged in. Please try logging in again.
                </p>
              </div>
            </div>
          </div>
      )}
    </>
  );
}
