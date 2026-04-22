import React from 'react';



const Chip = ({ active = true }) => {


    return (
        <div className='border text-white '>
            {active ? (
                <div className='flex items-center bg-green-500'>
                    <div className='bg-green-800'>
                        
                    </div>
                    <p>Activo</p>
                </div>
            ) : (
                <div className='flex items-center bg-red-500'>
                    <div className='bg-red-800'>

                    </div>
                    <p>Inactivo</p>
                </div>
            )}
        </div>
    )
};

export default Chip;