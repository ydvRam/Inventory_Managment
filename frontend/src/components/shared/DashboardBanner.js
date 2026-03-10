"use client";

import { useState, useEffect } from "react";
import { getStoredUser } from "@/lib/auth";

export default function DashboardBanner() {
  const [dateLabel, setDateLabel] = useState("");
  const user = getStoredUser();

  useEffect(() => {
    const update = () =>
      setDateLabel(
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-[#bde97c] rounded-lg mb-8 mt-5 flex justify-between shadow-sm min-h-[120px]">
      <div className="flex flex-col gap-1 p-5">
        <p className="text-black text-base">{dateLabel}</p>
        <p className="text-black font-semibold text-2xl mt-1">
          Hello , {user?.name || user?.email || "User"}
        </p>
      </div>
      <div className="shrink-0 relative w-140 min-w-[150px] min-h-[120px] rounded-lg overflow-hidden">
        <img
          src="https://home.atlassian.com/assets/43d10b5060d456dcdf989f80838e2e8a.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
