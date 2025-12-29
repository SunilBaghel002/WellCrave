// src/components/product/ProductGrid.jsx
import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductQuickView from "./ProductQuickView";
import { ProductGridSkeleton } from "../common/Loader";
import EmptyState from "../common/EmptyState";
import { FiPackage } from "react-icons/fi";

const ProductGrid = ({
  products,
  isLoading,
  columns = 4,
  showQuickView = true,
}) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  if (isLoading) {
    return <ProductGridSkeleton count={columns * 2} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<FiPackage size={48} />}
        title="No products found"
        description="Try adjusting your filters or search terms"
        actionLabel="Clear Filters"
        actionLink="/shop"
      />
    );
  }

  return (
    <>
      <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onQuickView={showQuickView ? setQuickViewProduct : undefined}
          />
        ))}
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
};

export default ProductGrid;
