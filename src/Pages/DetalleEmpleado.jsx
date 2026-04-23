import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Loader from '../Components/Atoms/Loader';
import { secureFetch } from "@/utils/secureFetchWrapper";
import { Tabs } from "../Components/untitled/tabs/tabs";
import { NativeSelect } from "../Components/untitled/base/select/select-native";
import Chip from '../Components/Atoms/Chip';
import Alert from "../Components/Atoms/Alerts";

const API_URL = import.meta.env.API_URL || "http://localhost:3000";
const AVATAR_PLACEHOLDER = "/user-circle.svg";

const tabs = [
    { id: "overview", label: "Overview" },
    { id: "expediente", label: "Expediente" },
];

const basicInfoFields = [
    { id: "1", label: "Correo Electronico", name: "email", value: "" },
    { id: "2", label: "Numero de Telefono", name: "phoneNumber", value: "" },
    { id: "3", label: "Calle", name: "address", value: "" },
    { id: "4", label: "Codigo Postal", name: "postalCode", value: "" },
];

const DetalleEmpleado = () => {
    const { employeeId } = useParams();

    const [employeeBasicInfo, setEmployeeBasicInfo] = useState(null);
    const [employeeAdminInfo, setEmployeeAdminInfo] = useState(null);
    const [employeeRecord, setEmployeeRecord] = useState(null);
    const [currentTab, setCurrentTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState({});

    useEffect(() => {
        if (!alert) return;
        const timer = setTimeout(() => setAlert({}), 4000);
        return () => clearTimeout(timer);
      }, [alert]);

    useEffect(() => {
        const getEmployeeDetail = async () => {
            console.log("Is it even firig?")
            try {
                const response = await secureFetch(`${API_URL}/employee/employee-detail/${employeeId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                console.log("Response: ", response);
                const data = await response.json();
                console.log("data: ", data);

                if (!response.ok) {
                    setAlert({ type: "error", message: `${data?.message}` });
                    throw new Error(data?.message || `Solicitud fallida (${response.status})`);
                }
                const basicInfo = data?.data?.employee?.basicInfo ?? null;
                const adminInfo = data?.data?.employee?.adminInfo ?? null;
                const record = data?.data?.employee?.record ?? null;
                
                setEmployeeBasicInfo(basicInfo);
                setEmployeeAdminInfo(adminInfo);
                setEmployeeRecord(record);
            } catch (err) {
                console.log("Error getting employee detail: ", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        getEmployeeDetail();
    }, []);

    if (isLoading) return <Loader />

    return (
        <div className='p-2 flex flex-col text-black'>

            {/* Notificación de éxito */}
            {alert && alert.message && (
                <div className="mb-4 fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <Alert type={alert?.type} message={alert?.message} />
                </div>
            )}

            {/* Row for Page Title and Tabs */}
            <div className='flex'>
                <h2>
                    Gestión de Empleados
                </h2>

                <NativeSelect
                    size="sm"
                    aria-label="Tabs"
                    value={currentTab}
                    onChange={(event) => setCurrentTab(event.target.value)}
                    options={tabs.map((tab) => ({ label: tab.label, value: tab.id }))}
                    className="w-80 md:hidden"
                />
                <Tabs selectedKey={currentTab} onSelectionChange={setCurrentTab} className="w-max max-md:hidden">
                    <Tabs.List type="underline" items={tabs}>
                        {(tab) => <Tabs.Item {...tab} />}
                    </Tabs.List>
                </Tabs>
            </div>

            {/* Box/Section for Basic Employee Info, Persistent across tabs */}
            <div className="w-full flex p-4 items-center gap-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* First column: avatar + status chip; second: text metrics */}
                <div className="h-full flex basis-1/5">
                    <div className="relative h-20 w-20 shrink-0 sm:h-40 sm:w-40">
                        <img
                            src={employeeBasicInfo?.picture?.trim() ? employeeBasicInfo.picture : AVATAR_PLACEHOLDER}
                            alt=""
                            className="h-full w-full object-cover rounded-full ring-1 ring-slate-200"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = AVATAR_PLACEHOLDER;
                            }}
                        />
                        <div className="absolute bottom-1 right-1 z-10">
                            <Chip active={employeeBasicInfo?.isActive ?? true} />
                        </div>
                    </div>
                </div>

                {/* Second column for the text information, broken into 2 columns */}
                <div className='w-full h-full flex flex-col basis-4/5 gap-6 justify-between'>
                    
                    {/* Top row for name/house and edit button, columns */}
                    <div className='h-full flex justify-between'>
                        
                        {/* Name/House */}
                        <div className='w-full'>
                            {/* Name */}
                            <h2>{employeeBasicInfo?.name ?? "Sin nombre"}</h2>
                            {/* subtitle */}
                            <h4>{employeeBasicInfo?.role ?? "Sin role"}</h4>
                        </div>

                        {/* Edit button */}
                        <div>
                            <button type="button" aria-label="Editar" className="rounded-lg p-2 hover:bg-slate-100">
                                <img src="/edit.svg" alt="" className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row for text-like metrics */}
                    <div className='flex justify-between items-center'>
                        <div>
                            <h6>ID Empleado</h6>
                            <h4>{employeeBasicInfo?.employeeId ?? "Sin ID"}</h4>
                        </div>
                        <div>
                            <h6>Casa</h6>
                            <h4>{employeeBasicInfo?.house ?? "Sin Casa"}</h4>
                        </div>
                        <div>
                            <h6>Fecha de Inicio</h6>
                            <h4>{employeeBasicInfo?.start ?? "Sin fecha de I"}</h4>
                        </div>
                        <div>
                            <h6>Fecha de Terminación</h6>
                            <h4>{employeeBasicInfo?.end ?? "N/A"}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final row, box depends on currentTab */}
            {/* Either the basic/admin info boxes or record/expediente box */}
            {currentTab == "overview" && (
                    <div className='flex mt-4 gap-4'>
                        
                        {/* Basic Info Box */}
                        <div className='w-full p-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm'>
                            <div className='flex jusfity-between'>
                                <h3>Información Básica</h3>
                                {/* edit button */}
                                <div>btn</div>
                            </div>

                            <div className='flex flex-cols'>
                                {basicInfoFields.map(field => (
                                    <div key={field.id}>
                                        <h6>{field.label ?? ""}</h6>
                                        <h4>{employeeBasicInfo?.[field.name] ?? "N/A"}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Admin Info Box */}
                        <div className='rounded-2xl border border-slate-200 bg-white p-8 shadow-sm'>
                            <div className='flex jusfity-between'>
                                <h3>Información Administrativa</h3>
                                {/* edit button */}
                                <div>btn</div>
                            </div>
                        </div>
                    </div>
            )}
            {currentTab == "expediente" && (
                <div>
                    Expediente
                </div>
            )}

        </div>
    );
};

export default DetalleEmpleado;