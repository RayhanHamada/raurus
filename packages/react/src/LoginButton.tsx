import { useState } from "react";

interface LoginButtonProps {
    isAuthenticated: boolean;
    isEditing: boolean;
    onLogin: (password: string) => Promise<boolean>;
    onEnterEdit: () => void;
    onExitEdit: () => void;
    onLogout: () => void;
}

function AuthModal({
    isAuthenticated,
    onClose,
    onLogin,
    onLogout,
    onEnterEdit,
}: {
    isAuthenticated: boolean;
    onClose: () => void;
    onLogin: (password: string) => Promise<boolean>;
    onLogout: () => void;
    onEnterEdit: () => void;
}) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError(null);
        setLoading(true);

        const success = await onLogin(password);

        setLoading(false);

        if (success) {
            onEnterEdit();
            onClose();
            return;
        }

        setError("Invalid password");
    };

    const buttonClass = "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 ring-1 ring-black/5">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                        {isAuthenticated ? (
                            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{isAuthenticated ? "Admin" : "Sign in"}</h2>
                    {!isAuthenticated && (
                        <p className="text-sm text-gray-500 mt-1">Enter your password to continue</p>
                    )}
                </div>

                {isAuthenticated ? (
                    <div className="flex gap-3">
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
                            className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-500`}
                            onClick={onClose}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            autoFocus
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        />

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
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
                                className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2`}
                                onClick={handleLogin}
                            >
                                {loading && (
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                )}
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export function LoginButton({
    isAuthenticated,
    isEditing,
    onLogin,
    onEnterEdit,
    onExitEdit,
    onLogout,
}: LoginButtonProps) {
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
            return onExitEdit();
        }
        if (isAuthenticated) {
            return onEnterEdit();
        }
        setShowModal(true);
    };

    return (
        <>
            <button
                type="button"
                className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 ring-1 ring-indigo-500/20"
                onClick={handleClick}
            >
                {label === "Edit" || label === "Exit Edit" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                )}
                {label}
            </button>

            {showModal && (
                <AuthModal
                    isAuthenticated={isAuthenticated}
                    onClose={() => setShowModal(false)}
                    onLogin={onLogin}
                    onLogout={onLogout}
                    onEnterEdit={onEnterEdit}
                />
            )}
        </>
    );
}
