// const axios = require('axios');

// exports.generateSchedule = async (req, res) => {
//     try {
//         // Lấy dữ liệu từ body của request
//         const { subjects, classes } = req.body;
  
//         // Phân loại giáo viên theo từng lớp
//         const classSubjectTeachers = {};
  
//         for (const cls of classes) {
//             classSubjectTeachers[cls.class_id] = {};
//             for (const subject of subjects) {
//                 if (subject.class_id === cls.class_id) {
//                     // Phân loại giáo viên dạy môn cho lớp này
//                     classSubjectTeachers[cls.class_id][subject.subject_code] = cls.subject_teacher;
//                 }
//             }
//         }
  
//         // Chuẩn bị dữ liệu để gửi cho Python
//         const inputData = {
//             subjects,
//             classes,
//             teacherAssignments: classSubjectTeachers,  // Dữ liệu phân loại giáo viên theo lớp
//             users: []  // Dữ liệu giáo viên và thông tin khác
//         };
  
//         // Gọi Python để xếp lịch
//         const result = await axios.post('http://127.0.0.1:5000/generate-schedule', inputData);
  
//         // Trả kết quả về cho client
//         res.json(result.data);
//     } catch (error) {
//         console.error('Error calling Python service:', error);
//         res.status(500).json({ message: 'Error calling Python service', error: error.message });
//     }
// };

const axios = require('axios');

exports.generateSchedule = async (req, res) => {
    try {
        // Lấy dữ liệu từ body của request
        const { subjects, classes, users } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ message: 'Subjects are required and must be a non-empty array' });
        }
        if (!classes || !Array.isArray(classes) || classes.length === 0) {
            return res.status(400).json({ message: 'Classes are required and must be a non-empty array' });
        }
        if (!users || !Array.isArray(users)) {
            return res.status(400).json({ message: 'Users must be an array (can be empty)' });
        }

        // Chuẩn bị dữ liệu để gửi cho Python
        const inputData = {
            subjects,
            classes,
            users: users || []  // Đảm bảo users luôn là mảng, nếu không có thì để rỗng
        };

        // Gọi Python để xếp lịch
        const result = await axios.post('http://127.0.0.1:5000/generate-schedule', inputData);

        // Kiểm tra nếu API Python trả về lỗi
        if (result.data.error) {
            return res.status(400).json({ message: 'Failed to generate schedule', error: result.data.error });
        }

        // Trả kết quả về cho client
        res.json(result.data);
    } catch (error) {
        console.error('Error calling Python service:', error.message);
        res.status(500).json({ 
            message: 'Error calling Python service', 
            error: error.response?.data || error.message 
        });
    }
};
