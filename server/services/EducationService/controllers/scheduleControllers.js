// const axios = require('axios');

// exports.generateSchedule = async (req, res) => {
//     try {
//         // Gọi API để lấy danh sách lớp Khối 12
//         const classResponse = await axios.get('http://localhost:4000/api/classes/khoi');
//         const classes = classResponse.data.map(cls => ({
//             class_id: cls.class_id,
//             class_name: cls.class_name,
//             subject_teacher: cls.subject_teacher || []
//         }));

//         if (!classes || classes.length === 0) {
//             return res.status(404).json({ message: 'Không tìm thấy lớp nào' });
//         }

//         // Chuẩn bị danh sách giáo viên (users)
//         const teacherIds = [...new Set(classes.flatMap(cls => cls.subject_teacher))];

//         let users = [];
//         if (teacherIds.length > 0) {
//             const userResponse = await axios.post('http://localhost:4003/api/users/teachers', { ids: teacherIds });
//             users = userResponse.data.map(user => ({
//                 user_id: user._id,
//                 name: user.name || 'Unknown Teacher'
//             }));
//         }
//         if (users.length === 0) {
//             return res.status(400).json({ message: 'Không tìm thấy giáo viên nào' });
//         }

//         // Chuẩn bị danh sách môn học (subjects) cho từng lớp
//         const subjects = [];
//         for (const cls of classes) {
//             for (const teacherId of cls.subject_teacher) {
//                 try {
//                     // Gọi API để lấy tdt_id từ user
//                     const userDetailResponse = await axios.get(`http://localhost:4003/api/users/${teacherId}`);
//                     const tdt_id = userDetailResponse.data.tdt_id;

//                     if (!tdt_id) {
//                         console.log(`Không tìm thấy tdt_id cho giáo viên ${teacherId}`);
//                         continue;
//                     }

//                     // Gọi API để lấy môn học của giáo viên dựa trên tdt_id
//                     const subjectResponse = await axios.get(`http://localhost:4001/api/departments/${tdt_id}/subjects`);
//                     const teacherSubjects = subjectResponse.data.map(subject => ({
//                         class_id: cls.class_id,
//                         subject_name: subject.subject_name,
//                         subject_code: subject.subject_code,
//                         teacher_id: teacherId
//                     }));
//                     subjects.push(...teacherSubjects);
//                 } catch (error) {
//                     console.log(`Lỗi khi lấy môn học cho giáo viên ${teacherId}:`, error.message);
//                     continue;
//                 }
//             }
//         }

//         if (subjects.length === 0) {
//             return res.status(400).json({ message: 'Không tìm thấy môn học nào' });
//         }

//         // Loại bỏ môn học trùng lặp trong cùng lớp
//         const uniqueSubjects = [];
//         const seen = new Set();
//         for (const subject of subjects) {
//             const key = `${subject.class_id}-${subject.subject_code}-${subject.teacher_id}`;
//             if (!seen.has(key)) {
//                 seen.add(key);
//                 uniqueSubjects.push(subject);
//             }
//         }

//         // Chuẩn bị dữ liệu để gửi cho Python
//         const inputData = {
//             subjects: uniqueSubjects,
//             classes,
//             users
//         };

//         // Gọi Python để xếp lịch
//         const result = await axios.post('http://127.0.0.1:5000/generate-schedule', inputData);

//         // Kiểm tra nếu API Python trả về lỗi
//         if (result.data.error) {
//             return res.status(400).json({ message: 'Failed to generate schedule', error: result.data.error });
//         }

//         // Trả kết quả về cho client
//         res.json(result.data);
//     } catch (error) {
//         console.error('Error calling services:', error.message);
//         res.status(500).json({
//             message: 'Error calling services',
//             error: error.response?.data || error.message
//         });
//     }
// };

const axios = require('axios');
const Schedule = require('../models/Schedule'); 

exports.generateSchedule = async (req, res) => {
    try {
        // Lấy schoolYear và semester từ request body
        const { schoolYear, semester } = req.body;
        if (!schoolYear || !semester) {
            return res.status(400).json({ message: 'Vui lòng cung cấp schoolYear và semester' });
        }

        // Gọi API để lấy danh sách lớp Khối 12
        const classResponse = await axios.get('http://localhost:4000/api/classes/khoi');
        const classes = classResponse.data.map(cls => ({
            class_id: cls.class_id,
            class_name: cls.class_name,
            subject_teacher: cls.subject_teacher || []
        }));

        if (!classes || classes.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lớp nào' });
        }

        // Chuẩn bị danh sách giáo viên (users)
        const teacherIds = [...new Set(classes.flatMap(cls => cls.subject_teacher))];

        let users = [];
        if (teacherIds.length > 0) {
            const userResponse = await axios.post('http://localhost:4003/api/users/teachers', { ids: teacherIds });
            users = userResponse.data.map(user => ({
                user_id: user._id,
                name: user.name || 'Unknown Teacher'
            }));
        }
        if (users.length === 0) {
            return res.status(400).json({ message: 'Không tìm thấy giáo viên nào' });
        }

        // Chuẩn bị danh sách môn học (subjects) cho từng lớp
        const subjects = [];
        for (const cls of classes) {
            for (const teacherId of cls.subject_teacher) {
                try {
                    const userDetailResponse = await axios.get(`http://localhost:4003/api/users/${teacherId}`);
                    const tdt_id = userDetailResponse.data.tdt_id;

                    if (!tdt_id) {
                        console.log(`Không tìm thấy tdt_id cho giáo viên ${teacherId}`);
                        continue;
                    }

                    const subjectResponse = await axios.get(`http://localhost:4001/api/departments/${tdt_id}/subjects`);
                    const teacherSubjects = subjectResponse.data.map(subject => ({
                        class_id: cls.class_id,
                        subject_name: subject.subject_name,
                        subject_code: subject.subject_code,
                        teacher_id: teacherId
                    }));
                    subjects.push(...teacherSubjects);
                } catch (error) {
                    console.log(`Lỗi khi lấy môn học cho giáo viên ${teacherId}:`, error.message);
                    continue;
                }
            }
        }

        if (subjects.length === 0) {
            return res.status(400).json({ message: 'Không tìm thấy môn học nào' });
        }

        // Loại bỏ môn học trùng lặp trong cùng lớp
        const uniqueSubjects = [];
        const seen = new Set();
        for (const subject of subjects) {
            const key = `${subject.class_id}-${subject.subject_code}-${subject.teacher_id}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueSubjects.push(subject);
            }
        }

        // Chuẩn bị dữ liệu để gửi cho Python
        const inputData = {
            subjects: uniqueSubjects,
            classes,
            users
        };

        // Gọi Python để xếp lịch
        const result = await axios.post('http://127.0.0.1:5000/generate-schedule', inputData);

        // Kiểm tra nếu API Python trả về lỗi
        if (result.data.error) {
            return res.status(400).json({ message: 'Failed to generate schedule', error: result.data.error });
        }

        // Chuyển đổi object thành mảng để lặp qua
        const schedules = Object.keys(result.data).map(classId => ({
            class_name: classId,
            schedule: Object.keys(result.data[classId]).map(day => ({
                day: day,
                periods: result.data[classId][day]
            }))
        }));

        // Lưu thời khóa biểu vào database
        const savedSchedules = [];

        for (const scheduleData of schedules) {
            const { class_name, schedule } = scheduleData;

            try {
                // Sử dụng phương thức createNewSchedule để lưu TKB mới
                const newSchedule = await Schedule.createNewSchedule(
                    class_name,
                    schoolYear,
                    semester,
                    schedule
                );
                savedSchedules.push(newSchedule);
            } catch (error) {
                console.error(`Lỗi khi lưu thời khóa biểu cho lớp ${class_name}:`, error.message);
                continue; // Tiếp tục với các lớp khác thay vì dừng lại
            }
        }

        if (savedSchedules.length === 0) {
            return res.status(500).json({ message: 'Không thể lưu thời khóa biểu nào vào database' });
        }

        // Trả kết quả về cho client
        res.json({
            message: 'Thời khóa biểu đã được tạo và lưu thành công',
            data: savedSchedules
        });
    } catch (error) {
        console.error('Error calling services:', error.message);
        res.status(500).json({
            message: 'Error calling services',
            error: error.response?.data || error.message
        });
    }
};