import React from "react";
import Button from "../components/atoms/Button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const toSignIn = () => {
    navigate("/iniciar-sesion");
  };

  return (
    <div className="w-full">
      <nav className="w-full px-4 py-2 border border-b bg-slate-900/80 z-50 flex justify-between items-center text-white ">
        <div className="flex gap-[10px]">
          <img src="/favicon.svg" />
          <h2>Red de Casas Hogar Qro</h2>
        </div>

        <div className="flex items-center gap-6">
          <h2>
            <a href="#landing">Home</a>
          </h2>
          <h2 className="whitespace-nowrap">La Red</h2>
          <h2>Nosotros</h2>
          <Button onClick={toSignIn}>Login</Button>
        </div>
      </nav>

      <section
        className="h-[90vh] w-full border border-black flex items-center justify-center"
        id="landing"
      >
        <h1 className="m-auto">Foto para la Landing</h1>
      </section>

      <section
        className="h-[90vh] w-full border border-black flex items-center justify-center"
        id="landing"
      >
        <h1 className="m-auto">Seccion #2</h1>
      </section>

      <footer className="h-[80vh] w-full p-auto">
        <h3>Footer para que nos conozcan</h3>
      </footer>
    </div>
  );
};

export default Landing;
