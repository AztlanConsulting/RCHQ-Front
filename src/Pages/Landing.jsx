import React from 'react';
// import { Typography } from 'mui/Typography';
import Button from '../Components/Button';
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate();
  
  const toSignIn = () => {
    navigate('/login')
  }

  return (
    <div className='w-full'>
      <navbar className="w-full p-[10%] fixed h-[18rem] flex justify-between text-white ">
        <div className='flex gap-[10px]'>
          <img src={'icons.svg'} />
          <h2>Red de Casas Hogar Qro</h2>
        </div>
        <div className='flex justify-around'>
          <h2>Home</h2>
          <h2>La Red</h2>
          <h2>Nosotros</h2>
          <Button onClick={toSignIn}>
            Login
          </Button>
        </div>
      </navbar>

      <section className='h-[80vh] w-full p-auto'>
        <h1>Foto para la Landing</h1>
      </section>

      <section className='h-[80vh] w-full p-auto'>
        <h1>Seccion para la red</h1>
      </section>

      <footer className='h-[80vh] w-full p-auto'>
        <h3>Footer para que nos conozcan</h3>
      </footer>
    </div>
  )
};

export default Landing;