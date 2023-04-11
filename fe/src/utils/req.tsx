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

export const addFolder = async (path: string) => {
  const fullPath = "/" + localStorage.getItem("dir") + path;
  const response = await fetch(config.backendurl + "/users/files/folder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    },
    body: JSON.stringify({ path: fullPath }),
  });
  return response;
};

export const addFolderFromZip = async (data: FormData) => {
  const response = await fetch(config.backendurl + "/users/folders/zip", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    },
    body: data,
  });
  return response;
};

export const addFileFromBuffer = async (data: FormData) => {
  const response = await fetch(config.backendurl + "/users/files/buffer", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    },
    body: data,
  });
  return response;
};

export const renameFileOrFolder = async (filename: string, newName: string) => {
  const path = localStorage.getItem("dir");
  const response = await fetch(config.backendurl + "/users/files", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    },
    body: JSON.stringify({ path: path + filename, newPath: path + newName }),
  });
  return response;
};

export const deleteFileOrFolder = async (filename: string) => {
  const path = localStorage.getItem("dir");
  const response = await fetch(config.backendurl + "/users/files", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    },
    body: JSON.stringify({ path: path + filename }),
  });
  return response;
};
