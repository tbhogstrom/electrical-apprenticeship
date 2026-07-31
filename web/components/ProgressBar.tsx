import { MathModuleProgress } from "@/lib/content";

export function ProgressBar({ module }: { module: MathModuleProgress }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm">
        <span>{module.title}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {module.percentComplete}%
        </span>
      </div>
      <div className="mt-1 h-2 w-full rounded bg-gray-200 dark:bg-gray-700">
        <div
          className="h-2 rounded bg-blue-600 dark:bg-blue-500"
          style={{ width: `${module.percentComplete}%` }}
        />
      </div>
    </div>
  );
}
