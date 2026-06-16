"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoaderSpin from "@/components/common/LoaderSpin";

const Page = () => {

  const router = useRouter();

  useEffect(() => {
    router.replace("/hub/fyp");
  });

  return <div className={"w-full h-full flex items-center justify-center"}>
    <LoaderSpin size={"xl"} />
  </div>;
};
export default Page;
