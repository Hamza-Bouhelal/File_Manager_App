import { config } from "./config";

export const refresh = async (refreshToken: string) => {
  const response = await fetch(config.backendurl + "/users/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: refreshToken }),
  });
  const data = await response.json();
  if (response.status === 200) {
    localStorage.setItem("accessToken", data.accessToken);
    return true;
  }
  localStorage.setItem("accessToken", "");
  localStorage.setItem("refreshToken", "");
  return false;
};

export const addTextFile = async (
  path: string,
  file: string,
  content: string
) => {
  const response = await fetch(config.backendurl + "/users/files/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    },
    body: JSON.stringify({ path, file, content }),
  });
  return response;
};
