// src/hooks/useReviews.js
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { reviewsAPI } from "../api/reviews";

export const useProductReviews = (productId, initialParams = {}) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [reviewsRes, statsRes] = await Promise.all([
        reviewsAPI.getProductReviews(productId, params),
        reviewsAPI.getProductStats(productId),
      ]);

      setReviews(reviewsRes.data.data);
      setStats(statsRes.data.data);
      setPagination({
        page: reviewsRes.data.pagination?.page || 1,
        limit: reviewsRes.data.pagination?.limit || 10,
        total: reviewsRes.data.pagination?.total || 0,
        totalPages: reviewsRes.data.pagination?.totalPages || 0,
      });

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch reviews";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [productId, params]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  return {
    reviews,
    stats,
    pagination,
    isLoading,
    error,
    params,
    fetchReviews,
    updateParams,
  };
};

export const useReviewActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReview = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await reviewsAPI.create(data);
      toast.success("Review submitted successfully!");
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to submit review";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateReview = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await reviewsAPI.update(id, data);
      toast.success("Review updated successfully!");
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update review";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await reviewsAPI.delete(id);
      toast.success("Review deleted");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete review";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const voteReview = useCallback(async (id, vote) => {
    try {
      const response = await reviewsAPI.vote(id, vote);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to vote";
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const reportReview = useCallback(async (id, reason) => {
    try {
      await reviewsAPI.report(id, reason);
      toast.success("Review reported");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to report review";
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  return {
    isLoading,
    error,
    createReview,
    updateReview,
    deleteReview,
    voteReview,
    reportReview,
  };
};

export const useMyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const response = await reviewsAPI.getMyReviews();
        setReviews(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch your reviews");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  return { reviews, isLoading, error };
};

export default useProductReviews;
