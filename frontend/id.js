// utils/device.ts
export const getDeviceId = () => {
  let id = localStorage.getItem("deviceId");

  if (!id) {
    id = crypto.randomUUID(); // unique per browser
    localStorage.setItem("deviceId", id);
  }

  return id;
};