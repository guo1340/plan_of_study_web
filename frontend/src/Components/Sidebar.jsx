import { BsHouseDoor, BsMap, BsBook, BsQuestionCircle, BsSearch} from "react-icons/bs";
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';


const Sidebar = ({children}) => {

    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => setIsOpen(!isOpen)
    const barItem = [
        {
            path: "/",
            name: "Home",
            icon: <BsHouseDoor />
        }, 

        {
            path: "/dashboard",
            name: "Dashboard",
            icon: <BsMap />
        }, 

        {
            path: "/courses",
            name: "Courses",
            icon: <BsBook />
        }, 

        {
            path: "/demos",
            name: "Demos",
            icon: <BsSearch />
        },

        {
            path: "/faq",
            name: "FAQ",
            icon: <BsQuestionCircle />
        }
    ]

}