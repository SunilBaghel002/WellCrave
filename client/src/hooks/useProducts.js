// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from "react";
import { productsAPI, categoriesAPI } from "../api/products";
import { buildQueryString } from "../utils/helpers";

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchProducts = useCallback(
    async (queryParams = params) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await productsAPI.getAll(queryParams);
        const { data, pagination: paginationData } = response.data;

        setProducts(data);
        setPagination({
          page: paginationData?.page || 1,
          limit: paginationData?.limit || 12,
          total: paginationData?.total || data.length,
          totalPages: paginationData?.totalPages || 1,
        });

        return { success: true, data };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch products";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchProducts(params);
  }, [params]);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const resetParams = useCallback(() => {
    setParams(initialParams);
  }, [initialParams]);

  const goToPage = useCallback(
    (page) => {
      updateParams({ page });
    },
    [updateParams]
  );

  return {
    products,
    pagination,
    isLoading,
    error,
    params,
    fetchProducts,
    updateParams,
    resetParams,
    goToPage,
  };
};

export const useProduct = (slugOrId, isSlug = true) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!slugOrId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = isSlug
        ? await productsAPI.getBySlug(slugOrId)
        : await productsAPI.getById(slugOrId);

      setProduct(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch product";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [slugOrId, isSlug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refetch: fetchProduct,
  };
};

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productsAPI.getFeatured();
        setProducts(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch featured products"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { products, isLoading, error };
};

export const useBestSellers = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await productsAPI.getBestSellers();
        setProducts(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch best sellers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  return { products, isLoading, error };
};

export const useNewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await productsAPI.getNewArrivals();
        setProducts(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch new arrivals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return { products, isLoading, error };
};

export const useRelatedProducts = (productId) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchRelated = async () => {
      try {
        const response = await productsAPI.getRelated(productId);
        setProducts(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch related products"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelated();
  }, [productId]);

  return { products, isLoading, error };
};

export const useProductSearch = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await productsAPI.search(query);
      setResults(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Search failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
};

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};

export const useCategoryTree = () => {
  const [tree, setTree] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await categoriesAPI.getTree();
        setTree(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch category tree"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTree();
  }, []);

  return { tree, isLoading, error };
};

export const useFeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await categoriesAPI.getFeatured();
        setCategories(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch featured categories"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { categories, isLoading, error };
};

export default useProducts;
