// src/components/common/Loader.jsx
import clsx from "clsx";

const sizes = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const Loader = ({
  size = "md",
  fullScreen = false,
  className = "",
  text = "",
}) => {
  const spinner = (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <div
        className={clsx(
          "animate-spin rounded-full border-4 border-primary-200 border-t-primary-600",
          sizes[size]
        )}
      />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const SkeletonLoader = ({ className = "" }) => (
  <div className={clsx("animate-pulse bg-gray-200 rounded-lg", className)} />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-card">
    <SkeletonLoader className="aspect-square w-full" />
    <div className="p-4 space-y-3">
      <SkeletonLoader className="h-4 w-3/4" />
      <SkeletonLoader className="h-4 w-1/2" />
      <SkeletonLoader className="h-6 w-1/3" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default Loader;
