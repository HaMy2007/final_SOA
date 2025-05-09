const axios = require("axios");

// Set to true for immediate sending (for testing), false for scheduled sending
const IMMEDIATE_SENDING = true; // Change to false for scheduling

const scheduleReportCardSending = async () => {
  try {
    console.log("📅 Bắt đầu lên lịch gửi bảng điểm...");

    // Fetch semester data from API
    let semester;
    try {
      const semesterRes = await axios.get("http://localhost:4001/api/semesters/current");
      semester = semesterRes.data;
      console.log("📚 Dữ liệu học kỳ từ API:", JSON.stringify(semester));
    } catch (apiErr) {
      console.error("❌ Lỗi khi lấy dữ liệu học kỳ từ API:", apiErr.message);
      // Fallback mock data if API fails
      semester = {
        _id: "68171f39caaa7b1c03b31352",
        semester_name: "HK2 2024-2025",
        semester_code: "24252",
        start_date: "2025-01-05T00:00:00.000Z",
        end_date: "2025-05-10T00:00:00.000Z"
      };
      console.log("📚 Sử dụng dữ liệu học kỳ dự phòng (mock):", JSON.stringify(semester));
    }

    // Schedule for 23:25 on May 9, 2025, Vietnam time (UTC+7)
    const endDateVN = new Date("2025-05-10T00:40:00.000+07:00");
    // Alternatively, use this for 00:36 on May 10, 2025
    // const endDateVN = new Date("2025-05-10T00:36:00.000+07:00");
    console.log("🧪 Lên lịch gửi bảng điểm vào:", endDateVN.toLocaleString());

    const now = new Date();
    let timeUntilSend = endDateVN.getTime() - now.getTime();

    // For immediate sending (testing)
    if (IMMEDIATE_SENDING) {
      timeUntilSend = 2 * 60 * 1000; // 2 minutes from now for testing
      console.log("🧪 Chế độ gửi thử nghiệm: Gửi sau 2 phút.");
    }

    if (timeUntilSend <= 0 && !IMMEDIATE_SENDING) {
      console.log("⏰ Đã quá thời gian gửi hoặc thời gian không hợp lệ.");
      return;
    }

    console.log(`📅 Hẹn gửi vào ${endDateVN.toLocaleString()} (còn ${Math.floor(timeUntilSend / 1000)} giây)`);

    setTimeout(async () => {
      try {
        console.log("⏰ Bắt đầu gửi bảng điểm...");

        // Fetch class list
        const classListRes = await axios.get(`http://localhost:4000/api/classes/khoi`);
        console.log("📋 Danh sách lớp:", JSON.stringify(classListRes.data));
        const classes = classListRes.data;
        const semesterId = semester._id;

        if (!classes || classes.length === 0) {
          console.log("⚠️ Không có lớp nào để gửi.");
          return;
        }

        for (const classItem of classes) {
          const classId = classItem.class_id;
          if (!classId) {
            console.error(`❌ Lớp không có class_id: ${JSON.stringify(classItem)}`);
            continue;
          }

          try {
            const url = `http://localhost:4002/api/students/send-report-card/${classId}?semester_id=${semesterId}`;
            console.log(`📤 Gửi yêu cầu tới: ${url}`);
            await axios.post(url);
            console.log(`✅ Gửi thành công cho lớp ${classId}`);
          } catch (err) {
            console.error(`❌ Lỗi gửi lớp ${classItem.name || classId}: ${err.message}`);
            if (err.response) {
              console.error(`Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`);
            }
          }
        }

        console.log("🎉 Đã gửi bảng điểm cho tất cả lớp.");
      } catch (err) {
        console.error("❌ Lỗi khi gửi bảng điểm:", err.message);
        if (err.response) {
          console.error(`Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`);
        }
      }
    }, timeUntilSend);
  } catch (err) {
    console.error("❌ Lỗi trong quá trình lên lịch:", err.message);
    if (err.response) {
      console.error(`Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`);
    }
  }
};

// Run scheduling automatically when the server starts
console.log("🚀 Khởi động hệ thống và lên lịch gửi bảng điểm...");
scheduleReportCardSending();