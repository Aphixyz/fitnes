"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function TrainerDashboard() {
  const { id } = useParams();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchTrainer() {
      try {
        const res = await fetch(`/api/trainer/${id}`);
        if (!res.ok) throw new Error("Trainer not found");
        const data = await res.json();
        setTrainer(data.trainer ? data.trainer : null);
      } catch (error) {
        console.error("Error fetching trainer:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrainer();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold mb-4">Trainer Dashboard</h1>
      {trainer ? (
        <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-md">
          <p><strong>Trainer ID:</strong> {trainer.trainer_id}</p>
          <p><strong>Username:</strong> {trainer.trainer_username}</p>
          <p><strong>Email:</strong> {trainer.trainer_email}</p>
          <p><strong>Status:</strong> {trainer.trainer_status === 1 ? "Active" : "Inactive"}</p>
          <div className="mt-4">
            <Link
              href={`/trainer/${id}/profile`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              View Profile
            </Link>
          </div>
          
        </div>
      ) : (
        <p className="text-red-500">Trainer not found</p>
      )}
    </div>
  );
}