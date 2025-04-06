const { exec } = require("child_process");

const runService = (name, command) => {
  console.log(`🚀 Đang khởi động ${name}...`);
  const process = exec(command);

  process.stdout.on("data", (data) => console.log(`[${name}] ${data}`));
  process.stderr.on("data", (data) => console.error(`[${name} LỖI] ${data}`));
};

// Khởi động API Gateway trước
runService("API Gateway", "cd api-gateway && npm start");

// Chờ 2 giây rồi chạy các service còn lại (tránh bị lỗi cổng)
setTimeout(() => {
    const services = ["ClassService", "EducationService", "ScoreService", "UserService"];
    services.forEach(service => {
        runService(service, `cd services/${service} && npm start`);
    });
}, 2000);



