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
    return (
        <div className = "sidebar_container">
            <div style = {{width: isOpen? "300px" : "100px"}} className = "sidebarStyle"> 
            {
                barItem.map((item, index) => (
                    <NavLink to={item.path} key={index} className="link" activeclassname="active">
                            <div className="icon">{item.icon}</div>
                            <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{item.name}</div>
                    </NavLink>
                ))

            }

            </div>


        </div>
    )

}