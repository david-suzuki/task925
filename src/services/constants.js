export const server_domain = "https://ww2.task925.com/?api";
export const apikey = "kkr78bc6fd9hp3WcE7Ui0244d1boan0t";
export const apisecret = "lle9ebagg48";
export const token = "dff0197768ba6725a346769fb485f46f";

export const PUSHER_APP_KEY = "26e3da3830b91b50533d";
export const PUSHER_APP_CLUSTER = "eu";
export const PUSHER_CHANNEL_PREFIX = "task925-ww2-";

export const WORKSPACE_MENUITEMS = [
  { label: "Edit Workspace", link: "" },
  { label: "Delete Workspace", link: "" },
];

export const PROJECT_MENUITEMS = [
  { label: "Edit Project", link: "" },
  { label: "Delete Project", link: "" },
];

export const getFormObj = () => {
  let formData = new FormData();
  formData.append("apikey", apikey);
  formData.append("apisecret", apisecret);
  formData.append("account_id", "ww2." + token);

  return formData;
};
