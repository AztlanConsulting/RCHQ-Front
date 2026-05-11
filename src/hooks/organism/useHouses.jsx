import { useState, useEffect } from "react";
import { getHousesService } from "../../services/houseService";

export const useHouses = () => {
  const [houses,  setHouses]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getHousesService();
        if (!cancelled) setHouses(res.data ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Error al cargar las casas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  const houseOptions = houses.map((h) => ({
    value: h.houseId,
    label: h.name,
  }));

  return { houseOptions, loading, error };
};