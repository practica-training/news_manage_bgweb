import request from '@/plugin/axios'
import setting from "@/setting"
let BaseUrl = setting.serverIp + "/";
let url = {
  adminLogin:"adminLogin",
  getAdmin:"manage/admin/id/"
}
export function AccountLogin (data) {
  console.log(data)
  let formData = new FormData();
  formData.append("adminName",data.adminName);
  formData.append("adminPassword",data.adminPassword);
  return request({
    url: BaseUrl+url.adminLogin,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    method: 'post',
    data:formData
  })
}
export function GetAdminInfo (id) {
  console.log(id)
  return request({
    url: BaseUrl+url.getAdmin+id,
    method: 'get',
  })
}
