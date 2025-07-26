import React from "react";
import GoalPageClient from "./GoalPageClient";

export default async function GoalPage({ params }) {
  const { id } = await params;
  const memberId = parseInt(id);

  return <GoalPageClient memberId={memberId} />;
}
