const API_URL = "http://localhost:3000";

const getToken = () => localStorage.getItem("token");

export const getEmployeeFormData = async () => {
    const token = getToken();

    const res = await fetch(`${API_URL}/employee/add`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        if (data.error) {
            throw new Error(data.error);
        }
        throw new Error("Error cargando datos del formulario");
    }

    return data;
};

export const createEmployee = async (formData) => {
    const token = getToken();

    const res = await fetch(`${API_URL}/employee/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
        let errorMessage = "Error desconocido. Intente más tarde";

        if (data.errors) {
            errorMessage = data.errors
                .map((e) => `${e.campo}: ${e.mensaje}`)
                .join("\n");
        } else if (data.error) {
            errorMessage = data.error;
        }

        const error = new Error(errorMessage);

        if (data.redirect) {
            error.redirect = data.redirect;
        }

        throw error;
    }

    return data;
};
