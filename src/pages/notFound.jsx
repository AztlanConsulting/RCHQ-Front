import React from 'react';
import { useNavigate } from 'react-router-dom';
import Type from '../components/atoms/type';
import SmallButton from '../components/atoms/smallButton';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-white p-6 text-center">
            <Type variant="page-title" as="h1" className="mb-2 text-6xl text-[#24375e]">
                404
            </Type>
            <Type variant="metric-label" className="mb-8 text-xl text-slate-500">
                ¡Ups! La página o el archivo que buscas no existe.
            </Type>
            <SmallButton
                text="Volver al inicio"
                onClick={() => navigate('/')}
            />
        </div>
    );
};

export default NotFound;