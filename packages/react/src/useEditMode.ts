import { useRaurus } from "./RaurusProvider";

export function useEditMode() {
    const { isEditing, isAuthenticated, enterEditMode, exitEditMode, login, logout } = useRaurus();
    return { isEditing, isAuthenticated, enterEditMode, exitEditMode, login, logout };
}
