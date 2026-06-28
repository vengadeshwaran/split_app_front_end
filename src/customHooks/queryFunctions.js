import axios from "axios";

export const queryHandler = async ({ queryKey }) => {
    const [endPoint, data] = queryKey;
    try {
        const response = await axios.get(`/${endPoint}`, {
            ...("params" in data && {
                params: {
                    ...data.params,
                },
            }),
            ...("token" in data && {
                headers: {
                    Authorization: `Bearer ${data.token}`,
                },
            }),
        });

        if (endPoint === "is-valid") {
            return response.data;
        }
        return response.data;
    } catch (error) {
        throw error; // Re-throw the error to be caught by the caller
    }
};

export const mutationHandler = async ({ endPoint, payload = null, method = "post", token = null, json = false }) => {
    try {
        const contentType = json ? "application/json" : "multipart/form-data";

        const requestOptions = {
            headers: {
                "Content-Type": contentType,
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            method,
        };

        const headers = requestOptions.headers;
        const m = method.toLowerCase();

        //console.log(`[API] ${method.toUpperCase()} ${axios.defaults.baseURL}/${endPoint}`, payload ?? "");

        let response;
        if (m === "post") {
            response = await axios.post(endPoint, payload, { headers });
        } else if (m === "put") {
            response = await axios.put(endPoint, payload, { headers });
        } else if (m === "patch") {
            response = await axios.patch(endPoint, payload, { headers });
        } else if (m === "delete") {
            response = await axios.delete(endPoint, { headers, data: payload });
        } else {
            response = await axios.get(endPoint, { headers, params: payload });
        }

        //console.log(`[API] ✅ ${response.status}`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[API] ❌ ${endPoint}`, {
            status:  error?.response?.status,
            data:    error?.response?.data,
            message: error?.message,
        });
        if (
            error?.response?.data?.message === "Your account is not activated" ||
            error?.response?.data?.message === "Unauthorized"
        ) {
            const authData = { accstatus: "deactivated" };
            localStorage.setItem("authUserD", JSON.stringify(authData));
            window.dispatchEvent(
                new StorageEvent("storage", {
                    key: "authUserD",
                    newValue: JSON.stringify(authData),
                })
            );
        }
        throw error;
    }
};

export const validateToken = async (token) => {
    try {
        const response = await axios.get(`/is-valid/`, {
            params: {
                token,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(
                `Request failed with status code ${response.status}`
            );
        }
        return response.data.data;
    } catch (error) {
        throw error; // Re-throw the error to be caught by the caller
    }
};

export const fileUpload = async ({ formData, endPoint, token }) => {
    try {
        const response = await axios.post(`/${endPoint}`, formData, {
            "Content-Type": "multipart/form-data",

            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        throw error; // Re-throw the error to be caught by the caller
    }
};
