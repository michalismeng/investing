import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession();

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

