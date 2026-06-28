import { useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import { mutationHandler, queryHandler, fileUpload } from "./queryFunctions";

export const useReusableMutation = (options) => {
    const reduxToken = useSelector((state) => state.user.token);

    const getToken = () =>
        reduxToken || JSON.parse(localStorage.getItem("authUser") || "{}")?.token || null;

    const wrappedMutationFn = (args) => {
        const fn = options?.formData ? fileUpload : mutationHandler;
        const isAuthEndpoint = args?.endPoint?.startsWith("auth/");
        const token = isAuthEndpoint ? null : getToken();
        return fn({ ...args, token });
    };

    const mutation = useMutation({
        mutationFn: wrappedMutationFn,
        refetchOnWindowFocus: false,
        retryOnMount: false,
        retry: false,
        ...options,
    });
    return mutation;
};

export const useResuableQuery = ({ endpoint, params = null, withToken = false, dependency = null, options = null, }) => {
    const reduxToken = useSelector((state) => state.user.token);
    const token = withToken
        ? reduxToken || JSON.parse(localStorage.getItem("authUser") || "{}")?.token || null
        : null;

    //console.log("[useResuableQuery]", endpoint, "| reduxToken:", reduxToken, "| token:", token);

    const data = {
        ...(params && { params }),
        ...(token && { token }),
    };
    const queryResponse = useQuery({
        queryKey: [endpoint, data, dependency],
        queryFn: queryHandler,
        enabled: !withToken || !!token,
        retry: false,
        retryOnMount: false,
        refetchOnWindowFocus: false,
        ...(options && options),
    });
    const { isError, error } = queryResponse;
    if (isError) {
        console.log("Query error", isError, error);
    }
    return queryResponse;
};
