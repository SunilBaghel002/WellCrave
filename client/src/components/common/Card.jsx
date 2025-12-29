// src/components/common/Card.jsx
import clsx from "clsx";
import { motion } from "framer-motion";

const Card = ({
  children,
  className = "",
  hover = false,
  padding = true,
  as: Component = "div",
  animate = false,
  ...props
}) => {
  const Wrapper = animate ? motion.div : Component;

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Wrapper
      className={clsx(
        "bg-white rounded-2xl shadow-card overflow-hidden",
        hover && "transition-shadow duration-300 hover:shadow-lg",
        padding && "p-6",
        className
      )}
      {...animationProps}
      {...props}
    >
      {children}
    </Wrapper>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={clsx("mb-4", className)}>{children}</div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={clsx("text-lg font-semibold text-gray-900", className)}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={clsx("text-sm text-gray-500 mt-1", className)}>{children}</p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={clsx("mt-4 pt-4 border-t border-gray-100", className)}>
    {children}
  </div>
);

export default Card;
