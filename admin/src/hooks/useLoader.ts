import { useState, useCallback } from "react";

export const useLoader = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  return { loading, startLoading, stopLoading };
};