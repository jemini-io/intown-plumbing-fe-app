import { Skill } from "@/lib/types/skill";

interface SkillCardProps {
  skill: Skill;
  onToggleEnabled: (skill: Skill) => void;
  onEdit: (skill: Skill) => void;
  onRemove: (skill: Skill) => void;
  onUnlinkService: (skillId: string, serviceId: string) => void;
  onUnlinkTechnician: (skillId: string, technicianId: string) => void;
}

export default function SkillCard({
  skill,
  onToggleEnabled,
  onEdit,
  onRemove,
  onUnlinkService,
  onUnlinkTechnician,
}: SkillCardProps) {
  return (
    <div
      className="grid items-start gap-4 px-6 py-5 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/50 mb-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
      style={{
        gridTemplateColumns: "1fr 64px 48px 48px",
      }}
    >
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-gray-900 dark:text-white">{skill.name}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate mt-3">{skill.description}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-gray-800 dark:text-gray-300">Associated Services:</span>
          {(!skill.serviceToJobTypes || skill.serviceToJobTypes.length === 0) ? (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">No associated services for this skill</span>
          ) : (
            skill.serviceToJobTypes.map(service => (
              <span
                key={service.id}
                className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full mr-2"
              >
                {service.displayName}
                <button
                  type="button"
                  className="ml-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:outline-none"
                  title="Unlink service"
                  onClick={() => onUnlinkService(skill.id, service.id)}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-gray-800 dark:text-gray-300">Associated Technicians:</span>
          {(!skill.technicians || skill.technicians.length === 0) ? (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">No associated technicians for this skill</span>
          ) : (
            skill.technicians.map(technician => (
              <span
                key={technician.id}
                className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full mr-2"
              >
                {technician.technicianName}
                <button
                  type="button"
                  className="ml-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:outline-none"
                  title="Unlink technician"
                  onClick={() => onUnlinkTechnician(skill.id, technician.id)}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-center items-start">
        <button
          type="button"
          role="switch"
          aria-checked={skill.enabled}
          onClick={() => onToggleEnabled(skill)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            skill.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
          } cursor-pointer`}
          title={skill.enabled ? "Disable skill" : "Enable skill"}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow transition ${
              skill.enabled ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <div className="flex justify-center items-start h-6">
        <button
          type="button"
          onClick={() => onEdit(skill)}
          className="px-2 py-0 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition h-6 flex items-center"
          title="Edit"
        >
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">EDIT</span>
        </button>
      </div>
      <div className="flex justify-center items-start h-6">
        <button
          type="button"
          onClick={() => onRemove(skill)}
          className="px-2 py-0 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition h-6 flex items-center"
          title="Remove"
        >
          <span className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">REMOVE</span>
        </button>
      </div>
    </div>
  );
}