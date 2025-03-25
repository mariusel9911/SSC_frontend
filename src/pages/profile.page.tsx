import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authApi } from "../api/authApi";
import { IUser } from "../api/types";
import TwoFactorAuth from "../components/TwoFactorAuth";
import useStore from "../store";
import { getErrorMessage } from "../utils/errorHandler";

const ProfilePage = () => {
  const [secret, setSecret] = useState({
    otpauth_url: "",
    base32: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
  const store = useStore();
  const user = store.authUser;

  const generateQrCode = async (user_id: string, email: string) => {
    try {
      store.setRequestLoading(true);
      const response = await authApi.post<{
        otpauth_url: string;
        base32: string;
      }>("/auth/otp/generate", { user_id, email });
      store.setRequestLoading(false);
      setOpenModal(true);
      setSecret({
        base32: response.data.base32,
        otpauth_url: response.data.otpauth_url,
      });
    } catch (error: any) {
      store.setRequestLoading(false);
      toast.error(getErrorMessage(error), { position: "top-right" });
    }
  };

  const disableTwoFactorAuth = () => {
    setShowPasswordModal(true);
  };

  const confirmDisable2FA = async () => {
    try {
      if (!password) {
        toast.error("Please enter your password", { position: "top-right" });
        return;
      }

      store.setRequestLoading(true);
      const { data } = await authApi.post<{ user: IUser }>("/auth/otp/disable", {
        user_id: user?.id,
        password
      });

      store.setAuthUser(data.user);
      setShowPasswordModal(false);
      setPassword("");
      toast.success("Two Factor Authentication Disabled", {
        position: "top-right",
      });
    } catch (error: any) {
      toast.error(getErrorMessage(error), { position: "top-right" });
    } finally {
      store.setRequestLoading(false);
    }
  };

  useEffect(() => {
    if (!store.authUser) {
      navigate("/login");
    }
  }, [store.authUser, navigate]);

  return (
      <>
        <section className="bg-ct-blue-600 min-h-screen pt-10">
          <div className="max-w-4xl p-12 mx-auto bg-ct-dark-100 rounded-md h-[20rem] flex gap-20 justify-center items-start">
            <div className="flex-grow-2">
              <h1 className="text-2xl font-semibold">Profile Page</h1>
              <div className="mt-8">
                <p className="mb-4">ID: {user?.id}</p>
                <p className="mb-4">Name: {user?.name}</p>
                <p className="mb-4">Email: {user?.email}</p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">
                Mobile App Authentication (2FA)
              </h3>
              <p className="mb-4">
                Secure your account with TOTP two-factor authentication.
              </p>
              {store.authUser?.otp_enabled ? (
                  <button
                      type="button"
                      className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
                      onClick={disableTwoFactorAuth}
                  >
                    Disable 2FA
                  </button>
              ) : (
                  <button
                      type="button"
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none"
                      onClick={() => generateQrCode(user?.id!, user?.email!)}
                  >
                    Setup 2FA
                  </button>
              )}
            </div>
          </div>
        </section>

        {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4">Confirm Password</h3>
                <input
                    type="password"
                    className="w-full p-2 border rounded mb-4"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                      onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                      className="bg-red-600 text-white px-4 py-2 rounded"
                      onClick={confirmDisable2FA}
                  >
                    Confirm Disable
                  </button>
                </div>
              </div>
            </div>
        )}

        {openModal && (
            <TwoFactorAuth
                base32={secret.base32}
                otpauth_url={secret.otpauth_url}
                user_id={store.authUser?.id!}
                closeModal={() => setOpenModal(false)}
            />
        )}
      </>
  );
};

export default ProfilePage;