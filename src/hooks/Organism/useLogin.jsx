import { useNavigate } from "react-router-dom";
import { useField } from "../Atoms/useField";
import { useToggle } from "../Atoms/useToggle";
import { loginService, getReadableErrors } from "../../Services/AuthService";
import { loginSchema } from "../../utils/Schema/Auth/auth.schemas";
import useAuth from "../useAuth";
import { useState } from "react";

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = useField();
  const password = useField();
  const showPassword = useToggle();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setErrors([]);

    const result = loginSchema.safeParse({
      email: email.value,
      password: password.value,
    });

    if (!result.success) {
      setErrors(result.error.issues.map((issue) => issue.message));
      return;
    }

    setLoading(true);

    try {
      const response = await loginService(
        result.data.email,
        result.data.password,
      );

      if (response.isActive2FA) {
        navigate("/2FA");
        return;
      }

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (!token) {
        setErrors(["No se recibió un token de sesión válido"]);
        return;
      }

      login({ token, user });
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setErrors(getReadableErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return { email, password, showPassword, errors, loading, handleSubmit };
};
