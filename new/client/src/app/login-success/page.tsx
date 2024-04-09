import { getServerSession } from "next-auth";
import prisma from '../../lib/prisma'


export default async function Page() {
  const session = await getServerSession();

  if(session && session.user?.email) {
    await prisma.user.upsert({
      where: {
        email: session.user?.email,
      },
      update: {},
      create: {
        email: session.user?.email,
        name: session.user?.name
      }
    });
  }

  return (
    <>
      get server session result
      {session?.user?.name ? (
        <>
        <div>{session?.user.name}</div>
        </>
      ) : (
        <div>Not logged in</div>
      )}
      <h2>Successful Login</h2>
    </>
  );
}

