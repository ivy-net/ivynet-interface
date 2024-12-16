import { toast } from "react-toastify";
import { router } from "../routes/rooter";
import axios, { AxiosRequestConfig, Method } from "axios";
import { getMessage } from "./UiMessages";

export const capitalize = (input: string) => {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export const shortenAddress = (input: string) => {
  return input.slice(0, 4) + "..." + input.slice(input.length - 4, input.length)
}


export const apiFetch = async<T>(resource: string, method: Method, data?: T, configs?: Partial<AxiosRequestConfig>) => {
  try {
    let headers: any = {}
    headers["Content-Type"] = "application/json"

    // Special handling for password set endpoint
    const isPasswordSetEndpoint = resource.includes("password_set");
    const baseUrl = isPasswordSetEndpoint
      ? process.env.IVY_ROOT_URL
      : process.env.REACT_APP_API_ENDPOINT;

    const url = resource.toString().startsWith("http")
      ? resource.toString()
      : `${baseUrl}/${resource}`;

    let config: Partial<AxiosRequestConfig> = {
      url,
      method,
      headers,
      withCredentials: true
    }

    if (data) {
      config.data = data
    }

    const response = await axios.request(config)
    return response
  }
  catch (err: any) {
    const errorMsg = !err.status
      ? getMessage(err.message)
      : getMessage(err.response.data) || getMessage(err.message)

    if (err.status === 401) {
      toast.error(errorMsg, { theme: "dark", toastId: errorMsg });
      router.navigate("/login")
    }
    else if (err.status) {
      toast.error(errorMsg, { theme: "dark", toastId: errorMsg });
    }
    else {
      toast.error(errorMsg, { theme: "dark", toastId: errorMsg });
    }
    return Promise.reject(err);
  }
}

export const validateEmail = (email: string) => {
  return !!email.toLowerCase().match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
};

export const getRandomClass = () => {
  return Math.random().toString(36).slice(2, 11)
}
