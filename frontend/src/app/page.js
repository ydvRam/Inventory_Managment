import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <h1 className="text-2xl font-semibold">Inventory</h1>
      <nav className="flex gap-4">
        <Link href="/login" className="px-4 py-2 bg-black text-white rounded">
          Login
        </Link>
        <Link href="/signup" className="px-4 py-2 border rounded hover:bg-zinc-100">
          Sign up
        </Link>
      </nav>
    </div>
  );
}
