export default function WorkoutPlanTable({ plans }) {
    return (
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Program Name</th>
            <th className="px-4 py-2">Member</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Start – End</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, idx) => (
            <tr key={plan.workout_plan_id} className="border-b">
              <td className="px-4 py-2">{idx + 1}</td>
              <td className="px-4 py-2">{plan.plan_name}</td>
              <td className="px-4 py-2">
                {plan.member_firstname} {plan.member_lastname}
              </td>
              <td className="px-4 py-2 capitalize">{plan.plan_status}</td>
              <td className="px-4 py-2">
                {plan.plan_startdate} – {plan.plan_enddate}
              </td>
              <td className="px-4 py-2">
                <a
                  href={`/trainer/${plan.trainer_id}/workout-plans/${plan.workout_plan_id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }