import React from "react";
import { useNavigate } from "react-router-dom";

/** Mock rows shaped like public.employee + house name, aligned with rhcq_back/data/seed.sql */
const MOCK_EMPLOYEES = [
  {
    employeeId: "a0000003-0000-4000-8000-000000000003",
    name: "Carlos",
    surname: "Ramírez",
    house: "Desarrollo",
    curp: "XAXX010101HDFXXX01",
    isActive: true,
  },
  {
    employeeId: "b1111111-1111-4111-8111-111111111111",
    name: "Ana",
    surname: "López",
    house: "Desarrollo",
    curp: "LOPA850101MDFPLN08",
    isActive: true,
  },
  {
    employeeId: "c2222222-2222-4222-8222-222222222222",
    name: "Luis",
    surname: "Hernández",
    house: "Tec de Monterrey",
    curp: "HEHL900315HDFRRS09",
    isActive: false,
  },
];

const Personal = () => {
  const navigate = useNavigate();

  const seeEmployeeDetail = (employeeID) => {
    navigate(`/app/detalle-empleado/${employeeID}`);
  };

  return (
    <div className="w-full h-[80vh] text-black">
      <div className="p-4 ml-2">
        <h2>Empleados</h2>
      </div>

      <div className="px-4 overflow-x-auto">
        <table className="w-full border-collapse border border-neutral-300 text-sm">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-300 p-2 text-left">Nombre</th>
              <th className="border border-neutral-300 p-2 text-left">Casa / ubicación</th>
              <th className="border border-neutral-300 p-2 text-left">CURP</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_EMPLOYEES.map((emp) => (
              <tr
                key={emp.employeeId}
                role="button"
                tabIndex={0}
                className="cursor-pointer hover:bg-neutral-50"
                onClick={() => seeEmployeeDetail(emp.employeeId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    seeEmployeeDetail(emp.employeeId);
                  }
                }}
              >
                <td className="border border-neutral-300 p-2">
                  {emp.name} {emp.surname}
                </td>
                <td className="border border-neutral-300 p-2">{emp.house}</td>
                <td className="border border-neutral-300 p-2">{emp.curp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Personal;
