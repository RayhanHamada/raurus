import { useState } from "react";

import { useRaurus } from "./RaurusProvider";

interface AuthModalProps {
    onClose: () => void;
    onSuccess: () => void;
    onLogout: () => void;
}

function AuthModal({ onClose, onSuccess, onLogout }: AuthModalProps) {
    const { login, isAuthenticated } = useRaurus();

    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError(null);
        setLoading(true);

        const success = await login(password);

        setLoading(false);

        if (success) {
            onSuccess();

            return;
        }

        setError("Invalid password");
    };

    const buttonClass = "flex-1 py-2 px-4 rounded-lg";

    return (
        <button
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
                <h2 className="text-lg font-semibold mb-4">{isAuthenticated ? "Admin" : "Login"}</h2>

                {isAuthenticated ? (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`${buttonClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
                            onClick={() => {
                                onLogout();
                                onClose();
                            }}
                        >
                            Logout
                        </button>

                        <button
                            type="button"
                            className={`${buttonClass} bg-gray-800 text-white hover:bg-gray-700`}
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            autoFocus
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                        <div className="flex gap-2">
                            <button
                                type="button"
                                className={`${buttonClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={loading || !password}
                                className={`${buttonClass} bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50`}
                                onClick={handleLogin}
                            >
                                {loading ? "..." : "Login"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </button>
    );
}

export function LoginButton() {
    const { isAuthenticated, isEditing, enterEditMode, exitEditMode, logout } = useRaurus();
    const [showModal, setShowModal] = useState(false);

    let label: string;
    if (isEditing) {
        label = "Exit Edit";
    } else if (isAuthenticated) {
        label = "Edit";
    } else {
        label = "Login";
    }

    const handleClick = () => {
        if (isEditing) {
            return exitEditMode();
        }
        if (isAuthenticated) {
            return enterEditMode();
        }
        setShowModal(true);
    };

    return (
        <>
            <button
                type="button"
                className="fixed bottom-4 right-4 z-40 opacity-20 hover:opacity-100 transition-opacity bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
                title={label}
                onClick={handleClick}
            >
                {label}
            </button>

            {showModal && (
                <AuthModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        enterEditMode();
                    }}
                    onLogout={logout}
                />
            )}
        </>
    );
}
