export const getRoleName = (user) => {
    const roleName =
        user?.role?.name ||
        user?.roleName ||
        user?.role ||
        "";

    return String(roleName).toLowerCase();
};

export const hasRole = (user, role) => {
    return getRoleName(user) === String(role).toLowerCase();
};
