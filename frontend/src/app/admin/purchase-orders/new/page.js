import { redirect } from "next/navigation";

export default function AdminNewPurchaseOrderRedirectPage() {
  redirect("/admin/purchase-orders");
}
