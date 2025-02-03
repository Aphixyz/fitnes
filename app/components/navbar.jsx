import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-black text-xl">
          <Link href="/">LogoEIEI</Link>
        </div>
        <div className="space-x-4">
          
        </div>
      </div>
    </nav>
  );
}