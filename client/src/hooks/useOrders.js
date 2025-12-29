// src/hooks/useOrders.js
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { ordersAPI } from "../api/orders";

export const useOrders = (initialParams = {}) => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchOrders = useCallback(
    async (queryParams = params) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await ordersAPI.getMyOrders(queryParams);
        const { data, pagination: paginationData } = response.data;

        setOrders(data);
        setPagination({
          page: paginationData?.page || 1,
          limit: paginationData?.limit || 10,
          total: paginationData?.total || data.length,
          totalPages: paginationData?.totalPages || 1,
        });

        return { success: true, data };
      } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch orders";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchOrders(params);
  }, [params]);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const goToPage = useCallback(
    (page) => {
      updateParams({ page });
    },
    [updateParams]
  );

  return {
    orders,
    pagination,
    isLoading,
    error,
    params,
    fetchOrders,
    updateParams,
    goToPage,
  };
};

export const useOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch order";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const cancelOrder = useCallback(
    async (reason) => {
      setIsLoading(true);

      try {
        const response = await ordersAPI.cancel(orderId, reason);
        setOrder(response.data.data);
        toast.success("Order cancelled successfully");
        return { success: true, data: response.data.data };
      } catch (err) {
        const message = err.response?.data?.message || "Failed to cancel order";
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [orderId]
  );

  const requestReturn = useCallback(
    async (reason) => {
      setIsLoading(true);

      try {
        const response = await ordersAPI.requestReturn(orderId, reason);
        setOrder(response.data.data);
        toast.success("Return request submitted");
        return { success: true, data: response.data.data };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to request return";
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [orderId]
  );

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
    cancelOrder,
    requestReturn,
  };
};

export default useOrders;
