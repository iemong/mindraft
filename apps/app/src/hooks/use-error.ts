import { toast } from "sonner";

export const useError = () => {
	const showError = (message: string) => {
		console.error(message);
		toast.error(message);
	};

	return { showError };
};
