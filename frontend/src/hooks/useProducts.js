import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useProducts() {
  const q = useQuery({ queryKey: ["products"], queryFn: async () => (await api.get("/products")).data });
  return { ...q, products: Array.isArray(q.data) ? q.data : [] };
}

export function useProduct(slug) {
  return useQuery({ queryKey: ["product", slug], queryFn: async () => (await api.get(`/products/${slug}`)).data, retry: false });
}
