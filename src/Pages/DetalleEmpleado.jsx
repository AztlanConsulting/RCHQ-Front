import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Loader from '../Components/Atoms/Loader';
import { secureFetch } from "@/utils/secureFetchWrapper";
import { Tabs } from "../Components/untitled/tabs/tabs";
import { NativeSelect } from "../Components/untitled/base/select/select-native";
import Chip from '../Components/Atoms/Chip';
import Alert from "../Components/Atoms/Alerts";
import Type from "../Components/Atoms/Type";

const API_URL = import.meta.env.API_URL || "http://localhost:3000";
const AVATAR_PLACEHOLDER = "/user-circle.svg";

const tabs = [
    { id: "overview", label: "Overview" },
    { id: "expediente", label: "Expediente" },
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
        <div className='flex flex-col gap-4 text-black'>

            {/* Notificación de éxito */}
            {alert && alert.message && (
                <div className="mb-4 fixed top-4 left-1/2 -translate-x-1/2 z-50">
                    <Alert type={alert?.type} message={alert?.message} />
                </div>
            )}

            {/* Row for Page Title and Tabs */}
            <div className="flex items-center gap-4">
                <Type variant="page-title" as="h2">
                    Gestión de Empleados
                </Type>

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
            <div className="w-full flex p-3 items-center rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* First column: avatar + status chip; second: text metrics */}
                <div className="flex shrink-0 mr-8">
                    <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
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
                            <Chip active={employeeBasicInfo?.isActive ?? false} />
                        </div>
                    </div>
                </div>

                {/* Second column for the text information, broken into 2 columns */}
                <div className="flex min-w-0 flex-1 flex-col gap-6 justify-between">
                    
                    {/* Top row for name/house and edit button, columns */}
                    <div className='h-full flex justify-between'>
                        
                        {/* Name/House */}
                        <div className="w-full min-w-0">
                            <Type variant="display-name" as="h3">
                                {`${employeeBasicInfo?.name ?? ""} ${employeeBasicInfo?.surname ?? ""}`}
                            </Type>
                            <Type variant="subtitle" as="p" className="mt-1">
                                {employeeBasicInfo?.role
                                ? String(employeeBasicInfo.role).toUpperCase() + " - "
                                : ""}
                                {employeeBasicInfo?.house?.name
                                ? String(employeeBasicInfo.house.name)
                                : ""}
                                {/* `${employeeBasicInfo?.role ?? "Sin role"} - ${employeeBasicInfo?.house?.name}`} */}
                            </Type>
                        </div>

                        {/* Edit button */}
                        <div>
                            <button type="button" aria-label="Editar" className="rounded-lg p-2 hover:bg-slate-100">
                                <img src="/edit.svg" alt="" className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row for text-like metrics */}
                    <div className="flex flex-wrap justify-between gap-x-4 gap-y-3">
                        <div>
                            <Type variant="metric-label" as="p">
                                ID Empleado
                            </Type>
                            <Type variant="metric-value" as="p" className="mt-0.5">
                                {employeeBasicInfo?.employeeId
                                    ? String(employeeBasicInfo.employeeId).slice(0, 8)
                                    : "Sin ID"}
                            </Type>
                        </div>
                        <div>
                            <Type variant="metric-label" as="p">
                                NSS
                            </Type>
                            <Type variant="metric-value" as="p" className="mt-0.5">
                                {employeeBasicInfo?.nss ?? "N/A"}
                            </Type>
                        </div>
                        <div>
                            <Type variant="metric-label" as="p">
                                Fecha de Inicio
                            </Type>
                            <Type variant="metric-value" as="p" className="mt-0.5">
                                {/* {employeeBasicInfo?.startDate ?? "Sin fecha de I"} */}
                                {employeeBasicInfo?.startDate
                                    ? String(employeeBasicInfo.startDate).slice(0, 10)
                                    : "Sin fecha de Inicio"}
                            </Type>
                        </div>
                        <div>
                            <Type variant="metric-label" as="p">
                                Fecha de Terminación
                            </Type>
                            <Type variant="metric-value" as="p" className="mt-0.5">
                                {employeeBasicInfo?.end ?? "N/A"}
                            </Type>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final row, box depends on currentTab */}
            {/* Either the basic/admin info boxes or record/expediente box */}
            {currentTab == "overview" && (
                    <div className='flex gap-4'>
                        
                        {/* Basic Info Box */}
                        <div className='basis-1/3 p-2 rounded-xl border border-slate-200 bg-white p-8 shadow-sm'>
                            <div className="flex justify-between">
                                <Type variant="section-title" as="h3">
                                    Información Básica
                                </Type>
                                <div>
                                    <button type="button" aria-label="Editar" className="rounded-lg p-2 hover:bg-slate-100">
                                        <img src="/edit.svg" alt="" className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-4">
                                <div className="min-w-[12rem flex-1">
                                    <Type variant="metric-label" as="p">
                                        Correo Electronico
                                    </Type>
                                    <Type variant="metric-value" as="p">
                                        {employeeBasicInfo?.email ?? "N/A"}
                                    </Type>
                                </div>
                                <div className="min-w-[12rem flex-1">
                                    <Type variant="metric-label" as="p">
                                        Número de Telefono
                                    </Type>
                                    <Type variant="metric-value" as="p">
                                        {employeeBasicInfo?.phoneNumber ?? "N/A"}
                                    </Type>
                                </div>
                                <div className="min-w-[12rem flex-1">
                                    <Type variant="metric-label" as="p">
                                        Dirección
                                    </Type>
                                    <Type variant="metric-value" as="p">
                                        {employeeBasicInfo?.address?.street ?? "N/A"}
                                    </Type>
                                </div>
                                <div className="min-w-[12rem flex-1">
                                    <Type variant="metric-label" as="p">
                                        Código Postal
                                    </Type>
                                    <Type variant="metric-value" as="p">
                                        {employeeBasicInfo?.address?.postal_code ?? "N/A"}
                                    </Type>
                                </div>
                                {/* {basicInfoFields.map((field) => (
                                    <div key={field.id} className="min-w-[12rem] flex-1">
                                        <Type variant="metric-label" as="p">
                                            {field.label ?? ""}
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeBasicInfo?.[field.name] ?? "N/A"}
                                        </Type>
                                    </div>
                                ))} */}
                            </div>
                        </div>
                        
                        {/* Admin Info Box */}
                        <div className='basis-2/3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm'>
                            <div className="flex justify-between">
                                <Type variant="section-title" as="h3">
                                    Información Administrativa
                                </Type>
                                <div>
                                    <button type="button" aria-label="Editar" className="rounded-lg p-2 hover:bg-slate-100">
                                        <img src="/edit.svg" alt="" className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 w-full flex flex-col gap-4">
                                <div className="w-full flex justify-between">
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Tipo
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Salario
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                </div>

                                <div className="w-full flex justify-between">
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Horario
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            N/A
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                </div>

                                <div className="w-full flex justify-between">
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Ausencias
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Numero
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                </div>

                                <div className="w-full flex justify-between">
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Vacaciones
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Numero
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                </div>

                                <div className="w-full flex justify-between">
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Faltas
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                    <div>
                                        <Type variant="metric-label" as="p">
                                            Numero
                                        </Type>
                                        <Type variant="metric-value" as="p" className="mt-0.5">
                                            {employeeAdminInfo?.start ?? "Sin fecha de I"}
                                        </Type>
                                    </div>
                                </div>
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