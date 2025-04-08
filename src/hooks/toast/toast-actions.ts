
import { genId, dispatch } from "./toast-state";
import { actionTypes, ToastOptions } from "./types";

function toast({ ...props }: ToastOptions) {
  const id = genId();

  const update = (props: ToastOptions) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

// Helper functions for common toast types
toast.success = (props: string | ToastOptions) => {
  const isString = typeof props === "string";
  return toast({
    variant: "default",
    title: isString ? props : props.title,
    description: !isString ? props.description : undefined,
  });
};

toast.error = (props: string | ToastOptions) => {
  const isString = typeof props === "string";
  return toast({
    variant: "destructive",
    title: isString ? props : props.title,
    description: !isString ? props.description : undefined,
  });
};

toast.warning = (props: string | ToastOptions) => {
  const isString = typeof props === "string";
  return toast({
    variant: "default",
    title: isString ? props : props.title,
    description: !isString ? props.description : undefined,
  });
};

export { toast };
