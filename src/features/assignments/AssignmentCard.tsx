import { motion } from "motion/react";
import { Link } from "react-router";
import { Badge } from "../../components/ui/Badge";
import type { Assignment } from "../../types";

const difficultyVariant = {
  easy: "success",
  medium: "warning",
  hard: "danger",
} as const;

export function AssignmentCard({
  assignment,
  index,
}: {
  assignment: Assignment;
  index: number;
}) {
  const isCommunity = assignment.origin === "community";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={`/assignments/${assignment._id}`}
        className={`group block rounded-xl border bg-surface-900/50 p-5 transition-all hover:border-surface-700 hover:bg-surface-900 ${
          isCommunity ? "border-emerald-800/60" : "border-surface-800"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-sm text-white transition-colors group-hover:text-brand-400">
            {assignment.title}
          </h3>
          <div className="flex gap-1">
            {isCommunity && (
              <Badge variant="success">
                Community
              </Badge>
            )}
            <Badge variant={difficultyVariant[assignment.difficulty]}>
              {assignment.difficulty}
            </Badge>
          </div>
        </div>
        {assignment.description && (
          <p className="mt-2 line-clamp-2 text-sm text-surface-400">
            {assignment.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <Badge variant="default">
            {assignment.mode === "read" ? "SELECT only" : "Read & Write"}
          </Badge>
          {isCommunity && assignment.contributor && (
            <span className="text-xs text-surface-500">
              by {assignment.contributor}
            </span>
          )}
          {!isCommunity && (
            <span className="text-surface-500 text-xs">Solve &rarr;</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
