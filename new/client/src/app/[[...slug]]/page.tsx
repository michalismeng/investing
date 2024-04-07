import Link from "next/link";

export default function Page() {
  return (
    <>
      <h2>Page Not Found!</h2>
      <Link href={"/companies"}>Click to go to main page</Link>
    </>
  );
}
