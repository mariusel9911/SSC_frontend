import { object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import FormInput from "../components/FormInput";
import { LoadingButton } from "../components/LoadingButton";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import useStore from "../store";
import { GenericResponse } from "../api/types";

const registerSchema = object({
  name: string().min(1, "Full name is required").max(100),
  email: string()
      .min(1, "Email address is required")
      .email("Email Address is invalid"),
  password: string()
      .min(1, "Password is required")
      .min(8, "Password must be more than 8 characters")
      .max(32, "Password must be less than 32 characters"),
  passwordConfirm: string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Passwords do not match",
});

export type RegisterInput = TypeOf<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const store = useStore();

  const methods = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitSuccessful]);

  const registerUser = async (data: RegisterInput) => {
    try {
      store.setRequestLoading(true);
      const response = await authApi.post<GenericResponse>("auth/register", {
        name: data.name,
        email: data.email.toLowerCase(), // Normalize email case
        password: data.password,
        passwordConfirm: data.passwordConfirm
      });

      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
    } catch (error: any) {
      const resMessage = getErrorMessage(error);
      toast.error(resMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      store.setRequestLoading(false);
    }
  };

  const getErrorMessage = (error: any): string => {
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        return error.response.data.message;
      }
      return `Request failed with status ${error.response.status}`;
    }
    return error.message || "Network error - please check your connection";
  };

  const onSubmitHandler: SubmitHandler<RegisterInput> = (values) => {
    registerUser(values);
  };

  return (
      <section className="py-8 bg-ct-blue-600 min-h-screen grid place-items-center">
        <div className="w-full">
          <h1 className="text-4xl xl:text-6xl text-center font-[600] text-ct-yellow-600 mb-4">
            Welcome to Maurice 2FA
          </h1>
          <h2 className="text-lg text-center mb-4 text-ct-dark-200">
            Sign Up To Get Started!
          </h2>
          <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmitHandler)}
                className="max-w-md w-full mx-auto overflow-hidden shadow-lg bg-ct-dark-200 rounded-2xl p-8 space-y-5"
            >
              <FormInput label="Full Name" name="name" />
              <FormInput label="Email" name="email" type="email" />
              <FormInput label="Password" name="password" type="password" />
              <FormInput
                  label="Confirm Password"
                  name="passwordConfirm"
                  type="password"
              />
              <span className="block">
              Already have an account?{" "}
                <Link to="/login" className="text-ct-blue-600">
                Login Here
              </Link>
            </span>
              <LoadingButton
                  loading={store.requestLoading}
                  textColor="text-ct-blue-600"
              >
                Sign Up
              </LoadingButton>
            </form>
          </FormProvider>
        </div>
      </section>
  );
};

export default RegisterPage;