import { createContext, ReactNode, useContext, useState } from "react";
import { ClassTypes } from "../types/class";

type ClassContext = {
  classes: ClassTypes[];
  handleAddClass: (newClass: ClassTypes) => void;
  isFormVisible: boolean;
  setIsFormVisible: (visible: boolean) => void;
  error: string;
  setError: (error: string) => void;
  handleCreateClass: () => void;
  studentClass: ClassTypes | undefined;
  setStudentClass: (studentClass: ClassTypes) => void;
  handleClassNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddAdvisor: (email: string) => void;
  handleEditAdvisor: (email: string) => void;
  advisor: string | null;
};

export const ClassContext = createContext<ClassContext | undefined>(undefined);

type ClassProviderProps = {
  children: ReactNode;
};

export const ClassProvider = ({ children }: ClassProviderProps) => {
  const [classes, setClasses] = useState<ClassTypes[]>([]);
  const [studentClass, setStudentClass] = useState<ClassTypes>({
    class_id: "",
    class_name: "",
    classTeacher: "",
    classMember: [],
    updatedAt: new Date().toISOString(),
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState("");
  const [advisor, setAdvisor] = useState<string | null>(null);
  const [newAdvisorEmail, setNewAdvisorEmail] = useState("");

  const generateRandomID = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleClassNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentClass(
      (prev: ClassTypes) =>
        ({
          ...prev,
          class_name: e.target.value,
        } as ClassTypes)
    );
  };

  const handleCreateClass = () => {
    if (!studentClass?.class_name) {
      setError("Tên lớp không được để trống!");
      return;
    }
    setError("");

    const newClass: ClassTypes = {
      id: generateRandomID(),
      class_name: studentClass?.class_name,
      classTeacher: "",
      classMember: [],
      updatedAt: new Date().toISOString(),
      class_id: generateRandomID(),
    };
    handleAddClass(newClass);

    setStudentClass((prev: ClassTypes) => ({
      ...prev,
      class_name: "",
    }));

    setError("");
    setIsFormVisible(false);
  };

  const handleAddClass = (newClass: ClassTypes) => {
    setClasses([...classes, newClass]);
  };

  const handleAddAdvisor = (email: string) => {
    setAdvisor(email);
    console.log("Thêm cố vấn với email:", email);
    setNewAdvisorEmail("");
  };

  const handleEditAdvisor = (email: string) => {
    setAdvisor(email);
    console.log("Chỉnh sửa cố vấn với email:", email);
    setNewAdvisorEmail("");
  };

  return (
    <ClassContext.Provider
      value={{
        handleEditAdvisor,
        handleClassNameChange,
        studentClass,
        setStudentClass,
        classes,
        handleAddClass,
        isFormVisible,
        setIsFormVisible,
        error,
        setError,
        handleCreateClass,
        handleAddAdvisor, // Cung cấp hàm thêm cố vấn
        advisor, // Cung cấp trạng thái cố vấn
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error("useClass must be used within a ClassProvider");
  }
  return context;
};
