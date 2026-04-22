import React, { useState, useEffect } from "react";
import userCircleUrl from "../assets/user-circle.svg?url";
import { useParams } from 'react-router-dom';
import Loader from '../Components/Atoms/Loader';
import { secureFetch } from "@/utils/secureFetchWrapper";
import { Tabs } from "../Components/untitled/tabs/tabs";
import { NativeSelect } from "../Components/untitled/base/select/select-native";
import Chip from '../Components/Atoms/Chip';

const API_URL = import.meta.env.API_URL || "http://localhost:3000";

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

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || `Solicitud fallida (${response.status})`);
                }
                const basicInfo = data?.data?.employee?.employeeBasicInfo ?? null;
                const adminInfo = data?.data?.employee?.employeeAdminInfo ?? null;
                const record = data?.data?.employee?.employeeRecord ?? null;
                
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
        <div className='p-6 flex flex-col text-black'>

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
            <div className="w-full flex p-2 items-center justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                {/* First column: avatar + status chip; second: text metrics */}
                <div className="h-full w-full flex">
                    <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
                        <img
                            src={employeeBasicInfo?.picture || userCircleUrl}
                            alt=""
                            className="h-full w-full object-cover rounded-2xl"
                        />
                        <div className="absolute bottom-1 right-1 z-10">
                            <Chip active={employeeBasicInfo?.isActive ?? true} />
                        </div>
                    </div>
                </div>

                {/* Second column for the text information, broken into 2 columns */}
                <div className='flex flex-col justify-between'>
                    
                    {/* Top row for name/house and edit button, columns */}
                    <div className='h-full flex flex-col justify-between'>
                        
                        {/* Name/House */}
                        <div className='w-full'>
                            {/* Name */}
                            <h2>{employeeBasicInfo?.name ?? "Sin nombre"}</h2>
                            {/* subtitle */}
                            <h4>{employeeBasicInfo?.role ?? "Sin role"}</h4>
                        </div>

                        {/* Edit button */}
                        <div>

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
                    <div className='flex'>
                        
                        {/* Basic Info Box */}
                        <div className='w-full p-2'>
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
                        <div className=''>
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