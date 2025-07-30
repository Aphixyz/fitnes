import React from "react";
import NewGoalWizard from "../NewGoalWizard";

export default async function NewGoalPage({ params }) {
  const { id } = await params;
  const memberId = parseInt(id);

  return <NewGoalWizard memberId={memberId} />;
}
