import sys
import json
import random
from ortools.sat.python import cp_model
from collections import defaultdict
from flask import Flask, request, jsonify
import time

app = Flask(__name__)

def generate_schedule(subjects, classes, users):
    model = cp_model.CpModel()

    # Xáo trộn dữ liệu môn học để thêm tính ngẫu nhiên
    random.shuffle(subjects)

    # Xây dựng dữ liệu
    class_ids = [cls['class_id'] for cls in classes]
    class_subjects = defaultdict(list)

    # Phân loại các môn học theo lớp
    for subject in subjects:
        if 'class_id' in subject and 'subject_name' in subject and 'teacher_id' in subject:
            class_subjects[subject['class_id']].append(subject)
        else:
            return {"error": "Invalid subject data format"}

    # Kiểm tra nếu không có môn học cho lớp
    for class_id in class_ids:
        if not class_subjects[class_id]:
            return {"error": f"No subjects found for class {class_id}"}

    # Tạo các biến lập lịch cho từng lớp
    schedule_vars = {}
    for class_id in class_ids:
        schedule_vars[class_id] = []
        num_subjects = len(class_subjects[class_id])
        if num_subjects == 0:
            return {"error": f"No subjects for class {class_id}"}
        for slot in range(30):  # 6 buổi, mỗi buổi 5 tiết
            var = model.NewIntVar(0, num_subjects - 1, f"{class_id}_{slot}")
            schedule_vars[class_id].append(var)

    # Ràng buộc: Không cho giáo viên dạy cùng lúc 2 lớp
    for slot in range(30):
        teacher_slots = defaultdict(list)
        for class_id in class_ids:
            var = schedule_vars[class_id][slot]
            for subject_index, subject in enumerate(class_subjects[class_id]):
                teacher_id = subject["teacher_id"]
                b = model.NewBoolVar(f"{class_id}_{slot}_is_{subject_index}")
                model.Add(var == subject_index).OnlyEnforceIf(b)
                model.Add(var != subject_index).OnlyEnforceIf(b.Not())
                teacher_slots[teacher_id].append(b)
        for teacher_id, bools in teacher_slots.items():
            if len(bools) > 1:
                model.Add(sum(bools) <= 1)

    # Ràng buộc: Mỗi môn học được dạy ít nhất 1 lần, tối đa 5 lần
    for class_id in class_ids:
        for subject_index, subject in enumerate(class_subjects[class_id]):
            subject_count = 0
            for slot in range(30):
                b = model.NewBoolVar(f"{class_id}_{slot}_count_{subject_index}")
                model.Add(schedule_vars[class_id][slot] == subject_index).OnlyEnforceIf(b)
                model.Add(schedule_vars[class_id][slot] != subject_index).OnlyEnforceIf(b.Not())
                subject_count += b
            model.Add(subject_count >= 1)
            model.Add(subject_count <= 5)

    # Ràng buộc: Trong 1 buổi (5 tiết), mỗi môn học tối đa 2 tiết
    for class_id in class_ids:
        for day in range(6):
            for subject_index in range(len(class_subjects[class_id])):
                subject_count_in_day = 0
                for period in range(5):
                    slot = day * 5 + period
                    b = model.NewBoolVar(f"{class_id}_day_{day}_period_{period}_subject_{subject_index}")
                    model.Add(schedule_vars[class_id][slot] == subject_index).OnlyEnforceIf(b)
                    model.Add(schedule_vars[class_id][slot] != subject_index).OnlyEnforceIf(b.Not())
                    subject_count_in_day += b
                model.Add(subject_count_in_day <= 2)

    # Thêm hàm mục tiêu với trọng số ngẫu nhiên để tạo lịch khác nhau
    objective_terms = []
    for class_id in class_ids:
        for slot in range(30):
            for subject_index in range(len(class_subjects[class_id])):
                b = model.NewBoolVar(f"{class_id}_{slot}_objective_{subject_index}")
                model.Add(schedule_vars[class_id][slot] == subject_index).OnlyEnforceIf(b)
                model.Add(schedule_vars[class_id][slot] != subject_index).OnlyEnforceIf(b.Not())
                random_weight = random.randint(1, 100)
                objective_terms.append(random_weight * b)

    # Tối đa hóa tổng trọng số ngẫu nhiên
    model.Maximize(sum(objective_terms))

    # Giải quyết mô hình
    solver = cp_model.CpSolver()
    # Sửa random_seed để nằm trong phạm vi hợp lệ (0 đến 2**31 - 1)
    solver.parameters.random_seed = int(time.time() * 1000) % (2**31)
    # Tăng tính ngẫu nhiên trong tìm kiếm
    solver.parameters.num_search_workers = 8  # Sử dụng nhiều luồng để tìm kiếm
    solver.parameters.randomize_search = True  # Bật chế độ tìm kiếm ngẫu nhiên

    status = solver.Solve(model)

    # Kiểm tra trạng thái giải pháp
    if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        return {"error": f"No feasible solution found. Solver status: {solver.StatusName(status)}"}

    # Kiểm tra trùng lặp giáo viên
    for day in range(6):
        for period in range(5):
            slot = day * 5 + period
            teacher_in_slot = defaultdict(list)
            for class_id in class_ids:
                subject_index = solver.Value(schedule_vars[class_id][slot])
                if 0 <= subject_index < len(class_subjects[class_id]):
                    subject = class_subjects[class_id][subject_index]
                    teacher_id = subject["teacher_id"]
                    teacher_in_slot[teacher_id].append(class_id)
            for teacher_id, class_list in teacher_in_slot.items():
                if len(class_list) > 1:
                    print(f"Trùng lặp giáo viên {teacher_id} tại Day {day+1}, Period {period+1}: {class_list}")

    # Lưu lịch trình vào kết quả
    result = {}
    for class_id in class_ids:
        timetable = {f"Day {day+1}": [] for day in range(6)}
        for day in range(6):
            for period in range(5):
                slot = day * 5 + period
                subject_index = solver.Value(schedule_vars[class_id][slot])
                if 0 <= subject_index < len(class_subjects[class_id]):
                    subject = class_subjects[class_id][subject_index]
                    timetable[f"Day {day+1}"].append({
                        "period": period + 1,
                        "subject": subject["subject_name"],
                        "teacher_id": subject["teacher_id"]
                    })
                else:
                    return {"error": f"Invalid subject index {subject_index} for class {class_id}"}
        result[class_id] = timetable
    return result

@app.route('/generate-schedule', methods=['POST'])
def generate_schedule_api():
    data = request.get_json()
    subjects = data['subjects']
    classes = data['classes']
    users = data['users']
    
    schedule = generate_schedule(subjects, classes, users)
    
    return jsonify(schedule)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
# import sys
# import json
# import random
# import logging
# from ortools.sat.python import cp_model
# from collections import defaultdict
# from flask import Flask, request, jsonify
# import time

# # Cấu hình logging
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)

# def generate_schedule(subjects, classes, users):
#     model = cp_model.CpModel()

#     # Xáo trộn dữ liệu môn học để thêm tính ngẫu nhiên
#     random.shuffle(subjects)

#     # Xây dựng dữ liệu
#     class_ids = [cls['class_id'] for cls in classes]
#     class_subjects = defaultdict(list)

#     # Phân loại các môn học theo lớp
#     for subject in subjects:
#         if 'class_id' in subject and 'subject_name' in subject and 'teacher_id' in subject:
#             class_subjects[subject['class_id']].append(subject)
#         else:
#             return {"error": "Invalid subject data format"}

#     # Kiểm tra nếu không có môn học cho lớp
#     for class_id in class_ids:
#         if not class_subjects[class_id]:
#             return {"error": f"No subjects found for class {class_id}"}

#     # Định nghĩa số tiết yêu cầu cho từng môn học (đã giảm Anh và Sinh)
#     subject_periods_required = {
#         "Toán": 4,
#         "Văn": 4,
#         "Anh": 3,  # Giảm từ 4 xuống 3
#         "Lý": 3,
#         "Hóa": 3,
#         "Sinh": 2,  # Giảm từ 3 xuống 2
#         "Sử": 2,
#         "Địa": 2,
#         "Tin": 2,
#         "Công nghệ": 2,
#         "Công dân": 1
#     }

#     # Kiểm tra dữ liệu môn học có khớp với yêu cầu không
#     for class_id in class_ids:
#         subject_counts = defaultdict(int)
#         for subject in class_subjects[class_id]:
#             subject_name = subject['subject_name']
#             subject_counts[subject_name] += 1
#         for subject_name, required_periods in subject_periods_required.items():
#             if subject_counts[subject_name] != 1:
#                 return {"error": f"Class {class_id} must have exactly 1 entry for subject {subject_name}, found {subject_counts[subject_name]}"}
#         total_periods = sum(subject_periods_required.values())
#         if total_periods != 28:  # Cập nhật tổng số tiết thành 28
#             return {"error": f"Total required periods ({total_periods}) must equal 28"}

#     # Định nghĩa số tiết mỗi ngày (Thứ 2 và Thứ 7: 4 tiết, các ngày khác: 5 tiết)
#     periods_per_day = [4, 5, 5, 5, 5, 4]  # Tổng: 28 khe thời gian
#     total_slots = sum(periods_per_day)

#     # Tạo các biến lập lịch cho từng lớp
#     schedule_vars = {}
#     for class_id in class_ids:
#         schedule_vars[class_id] = []
#         num_subjects = len(class_subjects[class_id])
#         if num_subjects == 0:
#             return {"error": f"No subjects for class {class_id}"}
#         for slot in range(total_slots):  # Tổng 28 khe thời gian
#             var = model.NewIntVar(0, num_subjects - 1, f"{class_id}_{slot}")
#             schedule_vars[class_id].append(var)

#     # Ràng buộc 1: Không cho giáo viên dạy cùng lúc 2 lớp
#     for slot in range(total_slots):
#         teacher_slots = defaultdict(list)
#         for class_id in class_ids:
#             var = schedule_vars[class_id][slot]
#             for subject_index, subject in enumerate(class_subjects[class_id]):
#                 teacher_id = subject["teacher_id"]
#                 b = model.NewBoolVar(f"{class_id}_{slot}_is_{subject_index}")
#                 model.Add(var == subject_index).OnlyEnforceIf(b)
#                 model.Add(var != subject_index).OnlyEnforceIf(b.Not())
#                 teacher_slots[teacher_id].append(b)
#         for teacher_id, bools in teacher_slots.items():
#             if len(bools) > 1:
#                 model.Add(sum(bools) <= 1)
#                 logger.debug(f"Ràng buộc giáo viên {teacher_id} không trùng lịch tại slot {slot}")

#     # Ràng buộc 2: Mỗi môn học được dạy đúng số tiết yêu cầu
#     for class_id in class_ids:
#         logger.debug(f"Áp dụng ràng buộc số tiết cho class {class_id}")
#         subject_counts = defaultdict(lambda: model.NewIntVar(0, 28, f"{class_id}_count"))
#         for slot in range(total_slots):
#             for subject_index, subject in enumerate(class_subjects[class_id]):
#                 b = model.NewBoolVar(f"{class_id}_{slot}_count_{subject_index}")
#                 model.Add(schedule_vars[class_id][slot] == subject_index).OnlyEnforceIf(b)
#                 model.Add(schedule_vars[class_id][slot] != subject_index).OnlyEnforceIf(b.Not())
#                 model.Add(subject_counts[subject['subject_name']] == b).OnlyEnforceIf(b)
#                 model.Add(subject_counts[subject['subject_name']] == 0).OnlyEnforceIf(b.Not())
#         for subject_name, count in subject_counts.items():
#             required_periods = subject_periods_required.get(subject_name)
#             if required_periods is None:
#                 return {"error": f"Unknown subject {subject_name} in class {class_id}"}
#             model.Add(count == required_periods)
#             logger.debug(f"Ràng buộc {subject_name} phải có {required_periods} tiết")

#     # Ràng buộc 3: Trong 1 buổi, mỗi môn học tối đa 4 tiết
#     slot_index = 0
#     for day in range(6):
#         num_periods = periods_per_day[day]
#         for class_id in class_ids:
#             for subject_index in range(len(class_subjects[class_id])):
#                 subject_count_in_day = 0
#                 for period in range(num_periods):
#                     slot = slot_index + period
#                     b = model.NewBoolVar(f"{class_id}_day_{day}_period_{period}_subject_{subject_index}")
#                     model.Add(schedule_vars[class_id][slot] == subject_index).OnlyEnforceIf(b)
#                     model.Add(schedule_vars[class_id][slot] != subject_index).OnlyEnforceIf(b.Not())
#                     subject_count_in_day += b
#                 model.Add(subject_count_in_day <= 4)
#                 logger.debug(f"Ràng buộc {class_id} Day {day+1} tối đa 4 tiết cho môn tại index {subject_index}")
#         slot_index += num_periods

#     # Thêm hàm mục tiêu với trọng số ngẫu nhiên
#     objective_terms = []
#     for class_id in class_ids:
#         for slot in range(total_slots):
#             for subject_index in range(len(class_subjects[class_id])):
#                 b = model.NewBoolVar(f"{class_id}_{slot}_objective_{subject_index}")
#                 model.Add(schedule_vars[class_id][slot] == subject_index).OnlyEnforceIf(b)
#                 model.Add(schedule_vars[class_id][slot] != subject_index).OnlyEnforceIf(b.Not())
#                 random_weight = random.randint(1, 100)
#                 objective_terms.append(random_weight * b)

#     model.Maximize(sum(objective_terms))

#     # Giải quyết mô hình
#     solver = cp_model.CpSolver()
#     solver.parameters.random_seed = int(time.time() * 1000) % (2**31)
#     solver.parameters.num_search_workers = 16
#     solver.parameters.randomize_search = True
#     solver.parameters.max_time_in_seconds = 120
#     solver.parameters.log_search_progress = True

#     logger.info("Bắt đầu giải quyết mô hình...")
#     status = solver.Solve(model)

#     if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
#         logger.error(f"Không tìm thấy giải pháp khả thi. Solver status: {solver.StatusName(status)}")
#         return {"error": f"No feasible solution found. Solver status: {solver.StatusName(status)}"}

#     # Kiểm tra trùng lặp giáo viên
#     slot_index = 0
#     for day in range(6):
#         num_periods = periods_per_day[day]
#         for period in range(num_periods):
#             slot = slot_index + period
#             teacher_in_slot = defaultdict(list)
#             for class_id in class_ids:
#                 subject_index = solver.Value(schedule_vars[class_id][slot])
#                 if 0 <= subject_index < len(class_subjects[class_id]):
#                     subject = class_subjects[class_id][subject_index]
#                     teacher_id = subject["teacher_id"]
#                     teacher_in_slot[teacher_id].append(class_id)
#             for teacher_id, class_list in teacher_in_slot.items():
#                 if len(class_list) > 1:
#                     print(f"Trùng lặp giáo viên {teacher_id} tại Day {day+1}, Period {period+1}: {class_list}")
#         slot_index += num_periods

#     # Lưu lịch trình vào kết quả
#     result = {}
#     slot_index = 0
#     for class_id in class_ids:
#         timetable = {f"Day {day+1}": [] for day in range(6)}
#         for day in range(6):
#             num_periods = periods_per_day[day]
#             for period in range(num_periods):
#                 slot = slot_index + period
#                 subject_index = solver.Value(schedule_vars[class_id][slot])
#                 if 0 <= subject_index < len(class_subjects[class_id]):
#                     subject = class_subjects[class_id][subject_index]
#                     timetable[f"Day {day+1}"].append({
#                         "period": period + 1,
#                         "subject": subject["subject_name"],
#                         "teacher_id": subject["teacher_id"]
#                     })
#                 else:
#                     return {"error": f"Invalid subject index {subject_index} for class {class_id}"}
#             slot_index += num_periods
#         result[class_id] = timetable
#     return result

# @app.route('/generate-schedule', methods=['POST'])
# def generate_schedule_api():
#     data = request.get_json()
#     subjects = data['subjects']
#     classes = data['classes']
#     users = data['users']
    
#     schedule = generate_schedule(subjects, classes, users)
    
#     return jsonify(schedule)

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)