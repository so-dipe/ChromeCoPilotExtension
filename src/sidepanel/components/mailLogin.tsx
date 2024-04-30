import React, { useState } from "react";
import serverUrl from "../../static/config";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

interface EmailLoginProps {
  email: string;
  onClose: () => void;
  onLogin: (password: string) => void;
}

const EmailLogin: React.FC<EmailLoginProps> = ({ email, onClose, onLogin }) => {
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleEmailAndPasswordLogin = () => {
    fetch(`${serverUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Failed to login: ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log(data);
        onLogin(password);
        navigate("profile");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-gray-100 bg-opacity-85">
      <div className="bg-white rounded-lg overflow-hidden shadow-md w-80">
        <div className="flex justify-end p-4">
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={onClose}
          >
            <FaTimes size={24} />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Login</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              className="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              type="email"
              placeholder="Email"
              value={email}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              className="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            onClick={handleEmailAndPasswordLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailLogin;
