import sys
import json
from ortools.sat.python import cp_model
from collections import defaultdict
from flask import Flask, request, jsonify

app = Flask(__name__)

def generate_schedule(subjects, classes, users):
    model = cp_model.CpModel()

    # Xây dựng dữ liệu
    class_ids = [cls['class_id'] for cls in classes]
    class_subjects = defaultdict(list)
    teacher_schedule = defaultdict(list)

    # Phân loại các môn học theo lớp
    for subject in subjects:
        class_subjects[subject['class_id']].append(subject)

    # Kiểm tra nếu không có môn học cho lớp
    for class_id in class_ids:
        if not class_subjects[class_id]:
            return {"error": f"No subjects found for class {class_id}"}

    # Xây dựng các phân công giáo viên từ class_teacher
    for cls in classes:
        for subject in class_subjects[cls['class_id']]:
            for teacher in cls['subject_teacher']:
                teacher_schedule[teacher].append({
                    'class_id': cls['class_id'],
                    'subject_code': subject['subject_code']
                })

    # Tạo các biến lập lịch cho từng lớp
    schedule_vars = {}
    for class_id in class_ids:
        schedule_vars[class_id] = []
        for slot in range(30):  # 6 buổi, mỗi buổi 5 tiết
            var = model.NewIntVar(0, len(class_subjects[class_id]) - 1, f"{class_id}_{slot}")
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

    # Ràng buộc: Mỗi môn học được dạy ít nhất 5 lần, tối đa 15 lần
    for class_id in class_ids:
        for subject_index, subject in enumerate(class_subjects[class_id]):
            subject_count = 0
            for slot in range(30):
                b = model.NewBoolVar(f"{class_id}_{slot}_count_{subject_index}")
                model.Add(schedule_vars[class_id][slot] == subject_index).OnlyEnforceIf(b)
                model.Add(schedule_vars[class_id][slot] != subject_index).OnlyEnforceIf(b.Not())
                subject_count += b
            model.Add(subject_count >= 5)  # Ít nhất 5 lần
            model.Add(subject_count <= 15)  # Tối đa 15 lần

    # Ràng buộc: Trong 1 buổi (5 tiết), mỗi môn học tối đa 2 tiết
    for class_id in class_ids:
        for day in range(6):  # 6 buổi
            for subject_index in range(len(class_subjects[class_id])):
                subject_count_in_day = 0
                for period in range(5):  # 5 tiết mỗi buổi
                    slot = day * 5 + period
                    b = model.NewBoolVar(f"{class_id}_day_{day}_period_{period}_subject_{subject_index}")
                    model.Add(schedule_vars[class_id][slot] == subject_index).OnlyEnforceIf(b)
                    model.Add(schedule_vars[class_id][slot] != subject_index).OnlyEnforceIf(b.Not())
                    subject_count_in_day += b
                model.Add(subject_count_in_day <= 2)  # Tối đa 2 tiết mỗi môn trong 1 buổi

    # Giải quyết mô hình
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    # Kiểm tra trạng thái giải pháp
    if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        return {"error": f"No feasible solution found. Solver status: {solver.StatusName(status)}"}

    # Lưu lịch trình vào kết quả
    result = {}
    for class_id in class_ids:
        timetable = {f"Day {day+1}": [] for day in range(6)}  # 6 buổi
        for day in range(6):  # 6 buổi
            for period in range(5):  # 5 tiết mỗi buổi
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