// src/components/common/EmptyState.jsx
import { Link } from "react-router-dom";
import Button from "./Button";

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {icon && (
        <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      )}

      {actionLabel &&
        (actionLink || onAction) &&
        (actionLink ? (
          <Link to={actionLink}>
            <Button>{actionLabel}</Button>
          </Link>
        ) : (
          <Button onClick={onAction}>{actionLabel}</Button>
        ))}
    </div>
  );
};

export default EmptyState;
