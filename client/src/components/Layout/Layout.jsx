// import React, { useContext, useEffect } from "react";
// import Footer from "../Footer/Footer";
// import Header from "../Header/Header";
// import { Outlet } from "react-router-dom";
// import { useAuth0 } from "@auth0/auth0-react";
// import UserDetailContext from "../../context/UserDetailContext";
// import { useMutation } from "react-query";
// import { createUser } from "../../utils/api";
// import useFavourites from "../../hooks/useFavourites";

// const Layout = () => {
//   useFavourites();

//   const { isAuthenticated, user, getAccessTokenWithPopup } = useAuth0();
//   const { setUserDetails } = useContext(UserDetailContext);

//   const { mutate } = useMutation({
//     mutationKey: [user?.email],
//     mutationFn: async ({ data, token }) => {
//       const receivedData = await createUser(data, token); // Call createUser and wait for response

//       if (receivedData && receivedData.user) {
   
   
//         // Update user details context with all relevant fields
//         setUserDetails((prev) => ({
//           ...prev, // Keep other existing details intact
//           email: receivedData.user.email,
//           firstName: receivedData.user.firstName,
//           lastName: receivedData.user.lastName,
//           fullName: receivedData.user.fullName,
//           picture: receivedData.user.picture ? receivedData.user.picture : user?.picture, // Check for null or undefined
//           DataOfBirth: receivedData.user.DataOfBirth, // Use the formatted date
//           balance: receivedData.user.balance,
//         }));
//       }
//     },
//   });


//   useEffect(() => {
//     const getTokenAndRegister = async () => {
//       try {
//         const res = await getAccessTokenWithPopup({
//           authorizationParams: {
//             audience: "http://localhost:8000",
//             scope: "openid profile email",
//           },
//         });
//         localStorage.setItem("access_token", res);
//         setUserDetails((prev) => ({ ...prev, token: res }));

//         if (user) {
//           // Call mutation with proper data
//           mutate({
//             data: {
//               email: user.email,
//               firstName: user.given_name || "",
//               lastName: user.family_name || "",
//               fullName: `${user.given_name || ""} ${user.family_name || ""}`.trim(), // Construct full name
//               picture: user.picture || "",
//               DataOfBirth: user.birthdate || null,
//               balance: 0, // Initialize balance to 0 for new users
//             },
//             token: res,
//           });
//         } else {
//           console.error("User data is undefined");
//         }
//       } catch (error) {
//         console.error("Error obtaining token:", error.message);
//       }
//     };

//     if (isAuthenticated) {
//       getTokenAndRegister(); // Fetch the token and register the user
//     }
//   }, [isAuthenticated]); // Ensure user is part of the dependencies

//   return (
//     <>
//       <div style={{ background: "var(--black)", overflow: "hidden" }}>
//         <Header />
//         <Outlet />
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default Layout;



import React, { useContext, useEffect } from "react";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import UserDetailContext from "../../context/UserDetailContext";
import { useMutation } from "react-query";
import { createUser } from "../../utils/api";
import useFavourites from "../../hooks/useFavourites";

const Layout = () => {
  useFavourites();

  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0(); // Changed to use getAccessTokenSilently
  const { setUserDetails } = useContext(UserDetailContext);

  const { mutate } = useMutation({
    mutationKey: [user?.email],
    mutationFn: async ({ data, token }) => {
      const receivedData = await createUser(data, token); // Call createUser and wait for response

      if (receivedData && receivedData.user) {
        // Update user details context with all relevant fields
        setUserDetails((prev) => ({
          ...prev, // Keep other existing details intact
          email: receivedData.user.email,
          firstName: receivedData.user.firstName,
          lastName: receivedData.user.lastName,
          fullName: receivedData.user.fullName,
          picture: receivedData.user.picture ? receivedData.user.picture : user?.picture, // Check for null or undefined
          DataOfBirth: receivedData.user.DataOfBirth, // Use the formatted date
          balance: receivedData.user.balance,
        }));
      }
    },
  });

  useEffect(() => {
    const getTokenAndRegister = async () => {
      try {
        // Get token silently without pop-ups
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: "http://localhost:8000",
            scope: "openid profile email",
          },
        });
        
        // Store token in localStorage and set user details context
        localStorage.setItem("access_token", token);
        setUserDetails((prev) => ({ ...prev, token }));

        // If user data is available, call mutation with user details
        if (user) {
          mutate({
            data: {
              email: user.email,
              firstName: user.given_name || "",
              lastName: user.family_name || "",
              fullName: `${user.given_name || ""} ${user.family_name || ""}`.trim(),
              picture: user.picture || "",
              DataOfBirth: user.birthdate || null,
              balance: 0, // Initialize balance for new users
            },
            token,
          });
        } else {
          console.error("User data is undefined");
        }
      } catch (error) {
        console.error("Error obtaining token silently:", error.message);
      }
    };

    if (isAuthenticated) {
      getTokenAndRegister(); // Fetch token and register user
    }
  }, [isAuthenticated]); // Re-run if user authentication changes

  return (
    <>
      <div style={{ background: "var(--black)", overflow: "hidden" }}>
        <Header />
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
