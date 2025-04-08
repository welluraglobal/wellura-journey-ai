
import { Toast, useToast as useToastPrimitive } from "@/components/ui/toast";

export const useToast = useToastPrimitive;

export type { Toast };

export const toast = (props: Toast) => {
  const { toast } = useToast();
  return toast(props);
};
