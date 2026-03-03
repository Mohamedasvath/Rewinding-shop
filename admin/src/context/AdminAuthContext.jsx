// import { createContext, useContext, useState } from "react";

// const AdminAuthContext = createContext();

// export const AdminAuthProvider = ({ children }) => {
//   const [admin, setAdmin] = useState(
//     localStorage.getItem("adminToken")
//   );

//   const login = (token) => {
//     localStorage.setItem("adminToken", token);
//     setAdmin(token);
//   };

//   const logout = () => {
//     localStorage.removeItem("adminToken");
//     setAdmin(null);
//   };

//   return (
//     <AdminAuthContext.Provider value={{ admin, login, logout }}>
//       {children}
//     </AdminAuthContext.Provider>
//   );
// };

// export const useAdminAuth = () => useContext(AdminAuthContext);
