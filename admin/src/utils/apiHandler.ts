import { toast } from "react-toastify";
import { ENV } from "./config";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const logout = () => {
  ENV.logOut();
  window.location.replace("/admin/signin");
};

const apiHelper = async (apiType: string, path: string, data: any) => {
  const token = localStorage.getItem("admin_token");
  const decryptedToken = ENV.decryptAdminToken(token);

  if (
    apiType === "post" ||
    apiType === "put" ||
    apiType === "get" ||
    apiType === "delete" ||
    apiType === "patch"
  ) {
    try {
      let response = await axios({
        method: apiType,
        url: `${path}`,
        data,
        headers: {
          Authorization: "Bearer " + `${decryptedToken ?? ""}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      return response;
    } catch (error: any) {
      if (error?.response?.data?.message) {
        if (error?.response?.status == 401) {
          toast.error("Session expired. Please Login again");
          logout();
        }
        if (apiType != "get" && apiType != "delete") {
          toast.error(error?.response?.data?.message);
        }
      } else {
        console.log("Error:", error?.message);
      }
      throw error;
    }
  }
};
const PromiseHandler = async (method: any) => {
  try {
    return await method;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export { PromiseHandler, apiHelper };
