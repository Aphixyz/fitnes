import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-black text-xl">
          <Link href="/">LogoEIEI</Link>
        </div>
        <div className="space-x-4">
          <Link href="/admin/admin_trainerlist" className="hover:bg-orange-400 text-black px-4 py-2 rounded-md">Trainer List</Link>
          <Link href="/admin/admin_memberlist" className="hover:bg-orange-400 text-black px-4 py-2 rounded-md">Member List</Link>
          <Link href="/" className="hover:bg-orange-400 text-black px-4 py-2 rounded-md">...</Link>
        </div>
      </div>
    </nav>
  );
}