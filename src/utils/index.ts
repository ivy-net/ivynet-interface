import React from "react";
import { toast } from "react-toastify";
import { router } from "../routes/rooter";
import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { getMessage } from "./UiMessages";

export const capitalize = (input: string) => {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export const shortenAddress = (input: string) => {
  return input.slice(0, 4) + "..." + input.slice(input.length - 4, input.length)
}


export const apiFetch = async<T>(resource: string, method: Method, data?: T, configs?: Partial<AxiosRequestConfig>) => {
  try {




    // Request interceptors
    let headers: any = {}
    headers["Content-Type"] = "application/json"

    // if (configs?.headers) {
    //   headers = configs.headers
    // }

    // headers = {
    //   ...headers,
    //   'Access-Control-Allow-Origin': '*',
    //   Accept: 'application/json',
    //   'Content-Type': 'application/json',
    // }



    // const sessionId = localStorage.getItem("session_id") || ""
    // if (sessionId) {
    //   // headers = { ...headers, "session_id": sessionId }
    // }



    const url = resource.toString().startsWith("http") ? resource.toString() : `${process.env.REACT_APP_API_ENDPOINT}/${resource}`;

    let config: Partial<AxiosRequestConfig> = { url, method, headers, withCredentials: true }
    if (data) {
      config.data = data
    }

    const response = await axios.request(config)

    return response
    // const response = await fetch(endpoint, {  });

    // if (response.ok) {
    //   return response;
    // }

    // const text = await response.text()
    // // Errors handling
    // if (response.status === 500) { // TODO: Add invalid token condition
    //   localStorage.removeItem("session_id")
    // }

    // if (response.status === 401) { // TODO: Add invalid token condition
    //   localStorage.removeItem("session_id")
    //   toast.error("Unauthorized access", { theme: "dark" });
    //   router.navigate("/login")
    // }
    // return Promise.reject(text);
  }
  catch (err: any) {
    debugger
    if (err.status === 500) {
      toast.error(getMessage(err.response.data), { theme: "dark" });
      console.log("what")
      router.navigate("/login")
    }
    return Promise.reject(err);
  }
}


