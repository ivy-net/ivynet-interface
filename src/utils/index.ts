import { redirect } from "react-router-dom";

export const capitalize = (input: string) => {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export const shortenAddress = (input: string) => {
  return input.slice(0, 4) + "..." + input.slice(input.length - 4, input.length)
}

const { fetch: originalFetch } = window;

window.fetch = async (...args) => {
  let [resource, config] = args;

  // Request interceptors

  const endpoint = resource.toString().startsWith("http") ? resource : `${process.env.REACT_APP_API_ENDPOINT}/${resource}`;
  const response = await originalFetch(endpoint, config);

  // Errors handling

  if (!response.ok && response.status === 404) {
    return Promise.reject(response); // 404 error handling
  }

  if (!response.ok && response.status === 500) { // TODO: Add invalid token condition
    localStorage.removeItem("session_id")
    redirect("/")
    return Promise.reject(response);
  }

  return response;
}


