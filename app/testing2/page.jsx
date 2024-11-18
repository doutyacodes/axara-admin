// "use client";
// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import useAuth from "../hooks/useAuth";
// import GlobalApi from "@/app/api/_services/GlobalApi";
// import { useChildren } from "@/context/CreateContext";
// import Image from "next/image";

// const page = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [newChildName, setNewChildName] = useState("");
//   const [newChildGender, setNewChildGender] = useState("");
//   const [newChildAge, setNewChildAge] = useState("");
//   const { isAuthenticated, loading, logout } = useAuth();
//   const {
//     childrenData,
//     updateChildrenData,
//     selectedChildId,
//     selectChild,
//     selectChildAge,
//   } = useChildren(); // Access context
//   const [userLoading, setUserLoading] = useState(false);
//   useEffect(() => {
//     const fetchChildren = async () => {
//       try {
//         setUserLoading(true);
//         if (isAuthenticated && childrenData.length === 0) {
//           const token =
//             typeof window !== "undefined"
//               ? localStorage.getItem("token")
//               : null;

//           const response = await GlobalApi.GetUserChildren(token);
//           updateChildrenData(response.data.data); // Update context with fetched children
//           if (response.data.data.length > 0) {
//             selectChild(response.data.data[0].id); // Automatically select the first child
//             selectChildAge(response.data.data[0].age); // Automatically select the first child
//           }
//         }
//       } catch (error) {
//         console.log(error);
//       } finally {
//         setUserLoading(false);
//       }
//     };

//     fetchChildren();
//   }, [isAuthenticated, childrenData, updateChildrenData, selectChild]);

//   const handleAddChild = async () => {
//     try {
//       await GlobalApi.AddChild({
//         name: newChildName,
//         gender: newChildGender,
//         age: newChildAge,
//       });
//       setShowModal(false);
//       setNewChildName("");
//       setNewChildGender("");
//       setNewChildAge("");

//       const response = await GlobalApi.GetUserChildren();
//       updateChildrenData(response.data.data); // Update context with new child data
//       selectChild(response.data.data[0].id); // Automatically select the newly added child
//       selectChildAge(response.data.data[0].age); // Automatically select the newly added child
//     } catch (error) {
//       console.error("Failed to add child", error);
//     }
//   };

//   if (loading) {
//     return (
//       <p className="w-full bg-white shadow-md fixed top-0 left-0 z-10 h-10">
//         Loading...
//       </p>
//     );
//   }

//   return (
//     <nav className="w-full md:bg-transparent bg-white max-md:shadow-md fixed top-0 left-0 z-10 pt-3">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex items-center">
//             {/* <h1 className="text-2xl font-bold text-orange-600">Doutya Ai</h1> */}
//             <Image
//               src={"/images/logo.png"}
//               width={150}
//               height={100}
//               alt="logo"
//             />
//           </div>
//           <div className="hidden md:flex items-center space-x-6">
//             <Link
//               href="/about-us"
//               className="block px-4 py-2 text-white hover:text-orange-600"
//             >
//               About Us
//             </Link>
//             <Link
//               href="/our-story"
//               className="block px-4 py-2 text-white hover:text-orange-600"
//             >
//               Our Story
//             </Link>
//             <Link
//               href="/contact-us"
//               className="block px-4 py-2 text-white hover:text-orange-600"
//             >
//               Contact Us{" "}
//             </Link>
//             {!userLoading && (
//               <select
//                 value={selectedChildId ? selectedChildId : ""}
//                 onChange={(e) => selectChild(e.target.value)}
//                 className="bg-white border rounded-md px-3 py-2"
//               >
//                 {childrenData.map((child) => (
//                   <option key={child.id} value={child.id}>
//                     {child.name}
//                   </option>
//                 ))}
//               </select>
//             )}
//             <button
//               onClick={() => setShowModal(true)}
//               className="text-white bg-blue-600 py-3 px-7 rounded-md font-bold"
//             >
//               Add Child
//             </button>
//             {isAuthenticated ? (
//               <button
//                 onClick={logout}
//                 className="text-white bg-red-600 py-3 px-7 rounded-md font-bold"
//               >
//                 Logout
//               </button>
//             ) : (
//               <Link
//                 href="/login"
//                 className="block px-4 py-2 text-white hover:text-orange-600"
//               >
//                 Login
//               </Link>
//             )}
//           </div>

//           <div className="md:hidden">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="text-gray-700 hover:text-orange-600 focus:outline-none"
//             >
//               <svg
//                 className="h-6 w-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d={
//                     isMenuOpen
//                       ? "M6 18L18 6M6 6l12 12"
//                       : "M4 6h16M4 12h16M4 18h16"
//                   }
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {isMenuOpen && (
//           <div className="md:hidden">
//             {!userLoading && (
//               <select
//                 value={selectedChildId ? selectedChildId : ""}
//                 onChange={(e) => selectChild(e.target.value)}
//                 className="bg-white border rounded-md px-3 py-2 mb-2 w-full"
//               >
//                 {childrenData.map((child) => (
//                   <option key={child.id} value={child.id}>
//                     {child.name} (Age: {child.age})
//                   </option>
//                 ))}
//               </select>
//             )}
//             <button
//               onClick={() => setShowModal(true)}
//               className="block w-full text-white bg-blue-600 rounded-md py-3 mb-2 font-bold"
//             >
//               Add Child
//             </button>
//             <Link
//               href="/my-search"
//               className="block px-4 py-2 text-gray-700 hover:text-orange-600"
//             >
//               Search History
//             </Link>

//             {isAuthenticated ? (
//               <button
//                 onClick={logout}
//                 className="block px-4 py-2 text-white bg-red-600 rounded-md font-bold"
//               >
//                 Logout
//               </button>
//             ) : (
//               <Link
//                 href="/signup"
//                 className="block px-4 py-2 text-white bg-orange-600 rounded-md font-bold"
//               >
//                 Get Started
//               </Link>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Modal for Adding a New Child */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//             <h2 className="text-lg font-bold mb-4">Add New Child</h2>
//             <div>
//               <label className="block mb-2">Name:</label>
//               <input
//                 type="text"
//                 value={newChildName}
//                 onChange={(e) => setNewChildName(e.target.value)}
//                 className="border rounded-md p-2 w-full mb-4"
//                 required
//               />
//               <label className="block mb-2">Gender:</label>
//               <select
//                 value={newChildGender}
//                 onChange={(e) => setNewChildGender(e.target.value)}
//                 className="border rounded-md p-2 w-full mb-4"
//               >
//                 <option value="">Select Gender</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//               </select>
//               <label className="block mb-2">Age:</label>
//               <input
//                 type="number"
//                 value={newChildAge}
//                 onChange={(e) => setNewChildAge(e.target.value)}
//                 className="border rounded-md p-2 w-full mb-4"
//                 required
//               />
//             </div>
//             <div className="flex justify-between">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="bg-gray-300 rounded-md px-4 py-2"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAddChild}
//                 className="bg-blue-600 text-white rounded-md px-4 py-2"
//               >
//                 Add
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default page;

import React from 'react'

const Testing = () => {
  return (
    <div>Testing</div>
  )
}

export default Testing