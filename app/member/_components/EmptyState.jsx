import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * EmptyState component displays a message when no data is available
 * @param {string} title - The title to display
 * @param {string} description - The description to display
 * @param {React.ReactNode} icon - Optional icon to display
 * @param {React.ReactNode} action - Optional action button
 */
const EmptyState = ({ title, description, icon, action }) => {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-center text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        {icon && <div className="mb-4 text-gray-400">{icon}</div>}
        <p className="text-center text-gray-500 mb-4">{description}</p>
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
