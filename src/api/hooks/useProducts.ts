import { useState, useEffect } from "react";
import productService from "../services/productService";
import type { Product } from "../../types";
import type { ErrorResponse } from "../types";

/**
 * Hook để lấy danh sách sản phẩm (khớp với NestJS backend)
 */
export const useProducts = (categorySlug?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProducts(categorySlug);
        setProducts(data);
      } catch (err) {
        const error = err as ErrorResponse;
        setError(error.response?.data?.message || "Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(categorySlug);
      setProducts(data);
    } catch (err) {
      const error = err as ErrorResponse;
      setError(error.response?.data?.message || "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch };
};

/**
 * Hook để lấy sản phẩm khuyến mãi
 */
export const useProductPromotions = (categorySlug?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductPromotions(categorySlug);
        setProducts(data);
      } catch (err) {
        const error = err as ErrorResponse;
        setError(error.response?.data?.message || "Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  return { products, loading, error };
};

/**
 * Hook để lấy chi tiết một sản phẩm
 */
export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        const error = err as ErrorResponse;
        setError(error.response?.data?.message || "Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};
