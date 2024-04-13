import { getServerSession } from "next-auth";
import prisma from "../../lib/prisma";
import { redirect } from 'next/navigation';
import Link from "next/link";

export default async function Page() {
  const session = await getServerSession();

  if (session && session.user?.email) {
    await prisma.user.upsert({
      where: {
        email: session.user?.email,
      },
      update: {},
      create: {
        email: session.user?.email,
        name: session.user?.name,
      },
    });

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
