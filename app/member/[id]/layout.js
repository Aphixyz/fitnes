"use client";

import { useParams } from "next/navigation";
import MemberNavbar from "../../components/MemberNavbar";

export default function MemberLayout({ children }) {
  const { id } = useParams();

  return (
    <section>
      <MemberNavbar />
      <main className="p-6">{children}</main>
    </section>
  );
}