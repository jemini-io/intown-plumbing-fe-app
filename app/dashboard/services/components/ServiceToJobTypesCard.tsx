import {
  WrenchIcon,
} from "@heroicons/react/24/solid";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";

const iconMap: Record<string, React.ElementType> = {
  wrench: WrenchIcon,
  contract: WrenchIcon, // Replace with actual icon
  siren: WrenchIcon, // Replace with actual icon
};

interface ServiceToJobTypesCardProps {
  service: ServiceToJobType;
  onToggleEnabled: (service: ServiceToJobType) => void;
  onEdit: (service: ServiceToJobType) => void;
  onRemove: (service: ServiceToJobType) => void;
  onUnlinkSkill: (serviceId: string, skillId: string) => void;
}

export default function ServiceToJobTypesCard({
  service,
  onToggleEnabled,
  onEdit,
  onRemove,
  onUnlinkSkill,
}: ServiceToJobTypesCardProps) {
  const IconComponent = iconMap[service.icon] || WrenchIcon;

  return (
    <div
      className="grid items-start gap-4 px-6 py-5 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/50 mb-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
      style={{
        gridTemplateColumns: "48px 1fr 64px 48px 48px",
      }}
    >
      <div className="flex justify-center items-start">
        <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-gray-900 dark:text-white">{service.displayName}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate mt-3">{service.description}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-gray-800 dark:text-gray-300">Skills:</span>
          {service.skills?.length === 0 ? (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              No associated skills for this service
            </span>
          ) : (
            service.skills?.map(skill => (
              <span
                key={skill.id}
                className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full mr-2"
              >
                {skill.name}
                <button
                  type="button"
                  className="ml-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:outline-none"
                  title="Unlink skill"
                  onClick={() => onUnlinkSkill(service.id, skill.id)}
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
          aria-checked={service.enabled}
          onClick={() => onToggleEnabled(service)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            service.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
          } cursor-pointer`}
          title={service.enabled ? "Disable service" : "Enable service"}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow transition ${
              service.enabled ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <div className="flex justify-center items-start h-6">
        <button
          type="button"
          onClick={() => onEdit(service)}
          className="px-2 py-0 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition h-6 flex items-center"
          title="Edit"
        >
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">EDIT</span>
        </button>
      </div>
      <div className="flex justify-center items-start h-6">
        <button
          type="button"
          onClick={() => onRemove(service)}
          className="px-2 py-0 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition h-6 flex items-center"
          title="Remove"
        >
          <span className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">REMOVE</span>
        </button>
      </div>
    </div>
  );
}