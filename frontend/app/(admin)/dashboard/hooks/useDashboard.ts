"use client"

import { useState } from "react";
import {
  useGetTotalStatisticsQuery,
  useGetApplicationsByYearQuery,
  useGetTop10BlogsQuery
} from "@/services/dashboard/dashboardApi";

export const useTotalStatistics = () => {
  const { data, isLoading, isError } = useGetTotalStatisticsQuery();
  return { data: data?.data || undefined, isLoading, isError };
};

export const useApplicationsByYear = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading, isError } = useGetApplicationsByYearQuery({ year });

  return {
    data: data?.data || undefined,
    isLoading,
    isError,
    year,
    setYear
  };
};

export const useTop10Blogs = () => {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  const { data, isLoading, isError } = useGetTop10BlogsQuery({ year, month });

  return {
    data: data?.data || undefined,
    isLoading,
    isError,
    year,
    setYear,
    month,
    setMonth
  };
};